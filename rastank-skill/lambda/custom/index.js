// Lambda Function code for Alexa.
// Paste this into your index.js file. 

const Alexa = require("ask-sdk");
const https = require("https");
const WebSocket = require('ws');

const invocationName = "ラズタンク";

const WSS_URL = process.env.WSS_URL || 'wss://hogehoge.execute-api.ap-northeast-1.amazonaws.com/Prod';

const SESSION_START   = process.env.SESSION_START   || 'session start';
const SESSION_END     = process.env.SESSION_END     || 'session stop';
const COMMAND_FORWARD = process.env.COMMAND_FORWARD || 'f 100 10';
const COMMAND_BACK    = process.env.COMMAND_BACK    || 'b 100 10';
const COMMAND_RIGHT   = process.env.COMMAND_RIGHT   || 'cr 100 10';
const COMMAND_LEFT    = process.env.COMMAND_LEFT    || 'cl 100 10';
const COMMAND_STOP    = process.env.COMMAND_STOP    || 's';
const COMMAND_DANCE   = process.env.COMMAND_DANCE   || 'dance';
const DIRECTION_UP    = process.env.DIRECTION_UP    || 'a 80';
const DIRECTION_DOWN  = process.env.DIRECTION_DOWN  || 'a 20';
const DIRECTION_FORWARD = process.env.DIRECTION_FORWARD || 'a 50';
const DIRECTION_RIGHT = process.env.DIRECTION_RIGHT || 'tr 50 3';
const DIRECTION_LEFT  = process.env.DIRECTION_LEFT  || 'tl 50 3';
const DIRECTION_BACK  = process.env.DIRECTION_BACK  || 'tr 100 5';

// 1. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        return responseBuilder
            .speak()
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = 'You asked for help. '; 

        say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        sendMessage(COMMAND_STOP);

        return responseBuilder
            .speak()
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_NavigateHomeIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const ForwardIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ForwardIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        sendMessage(COMMAND_FORWARD);

        return responseBuilder
            .speak()
            .reprompt()
            .getResponse();
    },
};

const BackIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'BackIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        sendMessage(COMMAND_BACK);

        return responseBuilder
            .speak()
            .reprompt()
            .getResponse();
    },
};

const RightIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'RightIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        sendMessage(COMMAND_RIGHT);

        return responseBuilder
            .speak()
            .reprompt()
            .getResponse();
    },
};

const LeftIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'LeftIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        sendMessage(COMMAND_LEFT);

        return responseBuilder
            .speak()
            .reprompt()
            .getResponse();
    },
};

const DirectionIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'DirectionIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let slotValue = request.intent.slots.Direction.value; 
        console.log(`Direction: ${slotValue}`);

        if (slotValue.indexOf('上') !== -1) {
            sendMessage(DIRECTION_UP);
        } else if (slotValue.indexOf('前') !== -1) {
            sendMessage(DIRECTION_FORWARD);
        } else if (slotValue.indexOf('下') !== -1) {
            sendMessage(DIRECTION_DOWN);
        } else if (slotValue.indexOf('右') !== -1) {
            sendMessage(DIRECTION_RIGHT);
        } else if (slotValue.indexOf('左') !== -1) {
            sendMessage(DIRECTION_LEFT);
        } else if (slotValue.indexOf('後ろ') !== -1) {
            sendMessage(DIRECTION_BACK);
        }

        return responseBuilder
            .speak()
            .reprompt()
            .getResponse();
    },
};

const StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'StopIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        sendMessage(COMMAND_STOP);

        return responseBuilder
             .speak()
             .reprompt()
             .getResponse();
    },
};

const DanceIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'DanceIntent' ;
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        sendMessage(COMMAND_DANCE);

        return responseBuilder
            .speak()
            .reprompt()
            .getResponse();
    },
};

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.log(JSON.stringify(handlerInput, null, 2));
        const responseBuilder = handlerInput.responseBuilder;

        sendMessage(SESSION_START);
        let say = invocationName + 'に接続しました. 指令をください.';

        return responseBuilder
            .speak(say)
            .reprompt()
            .withStandardCard('接続完了',
              'ラズタンクに接続しました！\n指令をください',
               welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        sendMessage(COMMAND_STOP);
        sendMessage(SESSION_END);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak('Sorry, an error occurred.  Please say again.')
            .reprompt('Sorry, an error occurred.  Please say again.')
            .getResponse();
    }
};


// 2. Constants ===========================================================================

    // Here you can define static data, to be used elsewhere in your code.  For example: 
    //    const myString = "Hello World";
    //    const myArray  = [ "orange", "grape", "strawberry" ];
    //    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = 'amzn1.ask.skill.hogehoge';

// 3.  Helper Functions ===================================================================
 
function randomElement(myArray) { 
    return(myArray[Math.floor(Math.random() * myArray.length)]); 
} 
 
function stripSpeak(str) { 
    return(str.replace('<speak>', '').replace('</speak>', '')); 
} 

/*
function sendMessage(message) {
  const client = new WebSocket(WSS_URL);
  client.on('open', function open() {
    client.send(`{"action":"sendMessage","data":"${message}"}`);
    client.close();
  });
}
*/

function sendMessage(message) {
    (async () => {
        try {
            await sendMessagePromise(message);
        } catch (err) {
            console.log(err);
        }
    })();
}

function sendMessagePromise(message) {
    return new Promise(function(resolve, reject) {
        const client = new WebSocket(WSS_URL);
        client.onopen = function() {
            client.send(`{"action":"sendMessage","data":"${message}"}`);
            client.close();
            resolve();
        };
        client.onerror = function(err) {
            reject(err);
        };
    });
}

function getSlotValues(filledSlots) { 
    const slotValues = {}; 
 
    Object.keys(filledSlots).forEach((item) => { 
        const name  = filledSlots[item].name; 
 
        if (filledSlots[item] && 
            filledSlots[item].resolutions && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0] && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
                case 'ER_SUCCESS_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name, 
                        ERstatus: 'ER_SUCCESS_MATCH' 
                    }; 
                    break; 
                case 'ER_SUCCESS_NO_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: '', 
                        ERstatus: 'ER_SUCCESS_NO_MATCH' 
                    }; 
                    break; 
                default: 
                    break; 
            } 
        } else { 
            slotValues[name] = { 
                heardAs: filledSlots[item].value, 
                resolved: '', 
                ERstatus: '' 
            }; 
        } 
    }, this); 
 
    return slotValues; 
} 
 
function getExampleSlotValues(intentName, slotName) { 
 
    let examples = []; 
    let slotType = ''; 
    let slotValuesFull = []; 
 
    let intents = model.interactionModel.languageModel.intents; 
    for (let i = 0; i < intents.length; i++) { 
        if (intents[i].name == intentName) { 
            let slots = intents[i].slots; 
            for (let j = 0; j < slots.length; j++) { 
                if (slots[j].name === slotName) { 
                    slotType = slots[j].type; 
 
                } 
            } 
        } 
         
    } 
    let types = model.interactionModel.languageModel.types; 
    for (let i = 0; i < types.length; i++) { 
        if (types[i].name === slotType) { 
            slotValuesFull = types[i].values; 
        } 
    } 
 
 
    examples.push(slotValuesFull[0].name.value); 
    examples.push(slotValuesFull[1].name.value); 
    if (slotValuesFull.length > 2) { 
        examples.push(slotValuesFull[2].name.value); 
    } 
 
 
    return examples; 
} 
 
function sayArray(myData, penultimateWord = 'and') { 
    let result = ''; 
 
    myData.forEach(function(element, index, arr) { 
 
        if (index === 0) { 
            result = element; 
        } else if (index === myData.length - 1) { 
            result += ` ${penultimateWord} ${element}`; 
        } else { 
            result += `, ${element}`; 
        } 
    }); 
    return result; 
} 
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.) 
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay 
    const hasDisplay = 
        handlerInput.requestEnvelope.context && 
        handlerInput.requestEnvelope.context.System && 
        handlerInput.requestEnvelope.context.System.device && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display; 
 
    return hasDisplay; 
} 
 
 
const welcomeCardImg = { 
    smallImageUrl: "https://s3-ap-northeast-1.amazonaws.com/dfs-songs/rastank720_480.jpg", 
    largeImageUrl: "https://s3-ap-northeast-1.amazonaws.com/dfs-songs/rastank1200_800.jpg"
}; 
 
const DisplayImg1 = { 
    title: 'Jet Plane', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png' 
}; 
const DisplayImg2 = { 
    title: 'Starry Sky', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png' 
 
}; 
 
function getCustomIntents() { 
    const modelIntents = model.interactionModel.languageModel.intents; 
 
    let customIntents = []; 
 
 
    for (let i = 0; i < modelIntents.length; i++) { 
 
        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) { 
            customIntents.push(modelIntents[i]); 
        } 
    } 
    return customIntents; 
} 
 
function getSampleUtterance(intent) { 
 
    return randomElement(intent.samples); 
 
} 
 
// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler, 
        AMAZON_HelpIntent_Handler, 
        AMAZON_StopIntent_Handler, 
        AMAZON_NavigateHomeIntent_Handler, 
        ForwardIntent_Handler, 
        BackIntent_Handler, 
        RightIntent_Handler, 
        LeftIntent_Handler, 
        DirectionIntent_Handler, 
        StopIntent_Handler, 
        DanceIntent_Handler, 
        LaunchRequest_Handler, 
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "ラズタンク",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "ForwardIntent",
          "slots": [],
          "samples": [
            "前に進め",
            "前進",
            "ゴー"
          ]
        },
        {
          "name": "BackIntent",
          "slots": [],
          "samples": [
            "後ろに進め",
            "後進",
            "バック",
            "戻れ"
          ]
        },
        {
          "name": "RightIntent",
          "slots": [],
          "samples": [
            "右に進め",
            "右に曲がれ",
            "右にカーブ",
            "右折",
            "右折して",
            "右折しろ",
            "右を向け",
            "右を向いて"
          ]
        },
        {
          "name": "LeftIntent",
          "slots": [],
          "samples": [
            "左に進め",
            "左に曲がれ",
            "左にカーブ",
            "左折",
            "左折して",
            "左折しろ",
            "左を向け",
            "左を向いて"
          ]
        },
        {
          "name": "DirectionIntent",
          "slots": [
            {
              "name": "Direction",
              "type": "Direction"
            }
          ],
          "samples": [
            "{Direction} を向け",
            "{Direction} 見ろ",
            "{Direction} 見て",
            "{Direction} を見て",
            "{Direction} を向いて",
            "{Direction} 向け",
            "{Direction} 向いて"
          ]
        },
        {
          "name": "StopIntent",
          "slots": [],
          "samples": [
            "止まって",
            "停止",
            "止まれ",
            "ストップ"
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": [
        {
          "name": "Direction",
          "values": [
            {
              "name": {
                "value": "正面"
              }
            },
            {
              "name": {
                "value": "左"
              }
            },
            {
              "name": {
                "value": "上"
              }
            },
            {
              "name": {
                "value": "下"
              }
            },
            {
              "name": {
                "value": "右"
              }
            },
            {
              "name": {
                "value": "後ろ"
              }
            },
            {
              "name": {
                "value": "前"
              }
            }
          ]
        }
      ]
    }
  }
};

