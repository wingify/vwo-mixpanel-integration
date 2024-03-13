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

function VWOMixpanelPlugin(mixpanel){
    window.VWO = window.VWO || [];

    if(!mixpanel.track || !mixpanel.people) {
        console.warn("VWO Mixpanel Plugin Log - mixpanel is not well defined");
        return;
    }

    var _vis_data = {};
    
    window.VWO.push([
        "onVariationApplied", function(data) {
            if (!data) 
                return;
            var expId = data[1];
            var variationId = data[2];
            if (expId && variationId &&
                ["VISUAL_AB", "VISUAL", "SPLIT_URL"].indexOf(window._vwo_exp[expId].type) > -1
            ) {
                _vis_data["VWO-Test-ID-" + expId] = window._vwo_exp[expId].comb_n[variationId];
                _vis_data["experiments"] = _vis_data["experiments"] || [];
                _vis_data["experiments"].push({"eN": window._vwo_exp[expId].name, "vN": window._vwo_exp[expId].comb_n[variationId]});

                mixpanel.track("VWO", _vis_data);
                for (var i = 0; i < _vis_data["experiments"].length; i++) {
                    var experiment = _vis_data["experiments"][i];
                    mixpanel.track("Experiment Started", {"Experiment name": experiment.eN, "Variant name": experiment.vN});
                }

                mixpanel.people.set({
                    $vwo_user_id: window.VWO.data.vin.uuid
                });
            }
        },
    ])
}

module.exports = VWOMixpanelPlugin