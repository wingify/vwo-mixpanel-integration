/**
 * Copyright 2024 Wingify Software Pvt. Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function VWOMixpanelPlugin(mixpanel) {
    if (typeof window === "undefined") {
        // Browser-only plugin; no-op on server
        return;
    }

    window.VWO = window.VWO || [];

    if (!mixpanel || typeof mixpanel.track !== "function" || !mixpanel.people) {
        console.warn("VWO Mixpanel Plugin Log - mixpanel is not well defined");
        return;
    }

    var EXPERIMENT_TYPES = ["VISUAL_AB", "VISUAL", "SPLIT_URL"];

    // Legacy-style payload that accumulates experiments for Mixpanel.
    var _vis_data = {
        experiments: []
    };

    // Per-page de-duplication so we don't double-track the same experiment/variation.
    var seenKeys = {};

    window.VWO.push([
        "onVariationApplied",
        function (data) {
            if (!data || typeof window._vwo_exp !== "object") {
                return;
            }

            var expId = data[1];
            var variationId = data[2];

            if (expId === undefined || variationId === undefined) {
                return;
            }

            var exp = window._vwo_exp[expId];
            if (!exp || EXPERIMENT_TYPES.indexOf(exp.type) === -1) {
                return;
            }

            var targetId = null;
            var targetName = null;
            var variationName = null;

            // Handle TARGETING experiments where variationId is "targetId,variationId"
            if (
                exp.iType &&
                exp.iType.type === "TARGETING" &&
                exp.iType.v === 2 &&
                typeof variationId === "string" &&
                variationId.indexOf(",") > -1
            ) {
                var parts = variationId.split(",");
                var tId = parts[0];
                var vId = parts[1];

                targetId = tId;
                if (exp.comb_n && exp.comb_n[tId]) {
                    targetName = exp.comb_n[tId];
                }

                if (
                    exp.sections &&
                    exp.sections[1] &&
                    exp.sections[1].variation_names &&
                    exp.sections[1].variation_names[vId]
                ) {
                    variationName = exp.sections[1].variation_names[vId];
                }
            } else {
                variationName =
                    exp.comb_n && exp.comb_n[variationId] ? exp.comb_n[variationId] : null;
            }

            if (!variationName) {
                return;
            }

            var key = String(expId) + ":" + String(variationId);
            if (seenKeys[key]) {
                return;
            }
            seenKeys[key] = true;

            // ---- Legacy _vis_data payload shape ----
            // Example:
            // {
            //   "VWO-Test-ID-12": "Variation A",
            //   "experiments": [{ eN: "Homepage Test", vN: "Variation A" }]
            // }

            _vis_data["VWO-Test-ID-" + expId] = variationName;
            _vis_data.experiments = _vis_data.experiments || [];
            _vis_data.experiments.push({
                eN: exp.name,
                vN: variationName,
                // Non-legacy field, only present when targeting is used.
                tN: targetName || undefined
            });

            // Aggregate VWO event with accumulated experiments (legacy behavior)
            mixpanel.track("VWO", _vis_data);

            // Per-experiment lifecycle event (emit only for the current experiment)
            // This avoids re-sending $experiment_started for older experiments when new ones fire.
            var expStartedProps = {
                "Experiment name": exp.name,
                "Variant name": variationName
            };
            if (targetName) {
                expStartedProps["Target name"] = targetName;
            }
            mixpanel.track("$experiment_started", expStartedProps);

            // Attach VWO UUID (if available) to the Mixpanel profile
            try {
                var vwoUuid =
                    window.VWO &&
                    window.VWO.data &&
                    window.VWO.data.vin &&
                    window.VWO.data.vin.uuid;

                if (vwoUuid) {
                    mixpanel.people.set({
                        $vwo_user_id: vwoUuid
                    });
                }
            } catch (e) {
                console.warn("VWO Mixpanel Plugin Log - failed to set vwo user id", e);
            }
        }
    ]);
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = VWOMixpanelPlugin;
}

if (typeof window !== "undefined") {
    window.VWOMixpanelPlugin = VWOMixpanelPlugin;
}
