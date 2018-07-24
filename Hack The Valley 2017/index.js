'use strict';

const Alexa = require('alexa-sdk');
var http = require("http");
const aws = require('aws-sdk');
const twilio_auth_token = 'dedfda4265cc7e3ebd890ce445a7901b'; // is only trial do not worry we know we shouldn't do this
const twilio_account_sid = 'AC9af3f2128ddb812932a55bf062bd1ce4';
const twilioclient = require('twilio')(twilio_account_sid, twilio_auth_token);
const deepai_api_key = 'e4402912-b41b-42af-8a76-356f798986c6'; // is also free-tier and as such we do not require this in the future.
const request = require('request');

const APP_ID = "amzn1.ask.skill.773968b1-1359-4506-80ce-4217a46dad68"; // TODO replace with your app ID (OPTIONAL).

const languageStrings = {
    'en': {
        translation: {
            // TODO: Update these messages to customize.
            SKILL_NAME: 'Stack Search',
            WELCOME_MESSAGE: "Welcome to %s. You can ask a question like, what\'s blockchain? ... Now, what can I help you with?",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: 'Stack Search',
            HELP_MESSAGE: "You can ask questions such as, what\'s bubblesort, or, you can say exit...Now, what can I help you with?",
            HELP_REPROMPT: "You can say things like, what\'s bubblesort, or you can say exit...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            RECIPE_REPEAT_MESSAGE: 'Try saying repeat.',
            NOT_FOUND_MESSAGE: "I\'m sorry, I currently do not know ",
        },
    },
};

// HELPERS ------------------------------------------------------------------------------------

// Search refers to the string given
function jsonapi (search, callback){
    var stackexchange = require('stackexchange-node');
    var options = { version: 2.2 };
	var context = new stackexchange(options);
	var re=/<pre><code>([\s\S]*?)<\/code><\/pre>/gm;
	var re2=/<(.*?)>/g;
	var m;
    var complete = {
        concept: [],
        code: [],
        title: '',
        is_code: false
    };
	var filter = {
  		pagesize: 1,
  		sort: 'relevance',
  		order: 'desc',
  		q: search,
  		filter: '!)R7_YdluAAl180(njTbqNhsH'
	};
    //console.log(context.search.advanced);
	context.search.advanced(filter, function (err, results){
        //console.log(results);
        if (err) throw err;
        var s;
        for(var i=0;i<results.items[0].answers.length;i++){
            if(results.items[0].answers[i].is_accepted){
                s=results.items[0].answers[i].body;
                break;
            }
        }
        complete.title=results.items[0].title;
        //complete.concept=s;
        //var s='<p><strong>You are a victim of <a href=\"//en.wikipedia.org/wiki/Branch_predictor\" rel=\"noreferrer\">branch prediction</a> fail.</strong></p>\n\n<hr>\n\n<h2>What is Branch Prediction?</h2>\n\n<p>Consider a railroad junction:</p>\n\n<p><a href=\"//commons.wikimedia.org/wiki/File:Entroncamento_do_Transpraia.JPG\" rel=\"noreferrer\"><img src=\"https://i.stack.imgur.com/muxnt.jpg\" alt=\"Licensed Image\"></a>\n<sub><a href=\"//commons.wikimedia.org/wiki/File:Entroncamento_do_Transpraia.JPG\" rel=\"noreferrer\">Image</a> by Mecanismo, via Wikimedia Commons. Used under the <a href=\"//creativecommons.org/licenses/by-sa/3.0/deed.en\" rel=\"noreferrer\">CC-By-SA 3.0</a> license.</sub></p>\n\n<p>Now for the sake of argument, suppose this is back in the 1800s - before long distance or radio communication.</p>\n\n<p>You are the operator of a junction and you hear a train coming. You have no idea which way it is supposed to go. You stop the train to ask the driver which direction they want. And then you set the switch appropriately.</p>\n\n<p><em>Trains are heavy and have a lot of inertia. So they take forever to start up and slow down.</em></p>\n\n<p>Is there a better way? You guess which direction the train will go!</p>\n\n<ul>\n<li>If you guessed right, it continues on.</li>\n<li>If you guessed wrong, the captain will stop, back up, and yell at you to flip the switch. Then it can restart down the other path.</li>\n</ul>\n\n<p><strong>If you guess right every time</strong>, the train will never have to stop.<br>\n<strong>If you guess wrong too often</strong>, the train will spend a lot of time stopping, backing up, and restarting.</p>\n\n<hr>\n\n<p><strong>Consider an if-statement:</strong> At the processor level, it is a branch instruction:</p>\n\n<p><img src=\"https://i.stack.imgur.com/pyfwC.png\" alt=\"image2\"></p>\n\n<p>You are a processor and you see a branch. You have no idea which way it will go. What do you do? You halt execution and wait until the previous instructions are complete. Then you continue down the correct path.</p>\n\n<p><em>Modern processors are complicated and have long pipelines. So they take forever to \"warm up\" and \"slow down\".</em></p>\n\n<p>Is there a better way? You guess which direction the branch will go!</p>\n\n<ul>\n<li>If you guessed right, you continue executing.</li>\n<li>If you guessed wrong, you need to flush the pipeline and roll back to the branch. Then you can restart down the other path.</li>\n</ul>\n\n<p><strong>If you guess right every time</strong>, the execution will never have to stop.<br>\n<strong>If you guess wrong too often</strong>, you spend a lot of time stalling, rolling back, and restarting.</p>\n\n<hr>\n\n<p>This is branch prediction. I admit it\'s not the best analogy since the train could just signal the direction with a flag. But in computers, the processor doesn\'t know which direction a branch will go until the last moment.</p>\n\n<p>So how would you strategically guess to minimize the number of times that the train must back up and go down the other path? You look at the past history! If the train goes left 99% of the time, then you guess left. If it alternates, then you alternate your guesses. If it goes one way every 3 times, you guess the same...</p>\n\n<p><strong><em>In other words, you try to identify a pattern and follow it.</em></strong> This is more or less how branch predictors work.</p>\n\n<p>Most applications have well-behaved branches. So modern branch predictors will typically achieve >90% hit rates. But when faced with unpredictable branches with no recognizable patterns, branch predictors are virtually useless.</p>\n\n<p>Further reading: <a href=\"//en.wikipedia.org/wiki/Branch_predictor\" rel=\"noreferrer\">\"Branch predictor\" article on Wikipedia</a>.</p>\n\n<hr>\n\n<h2>As hinted from above, the culprit is this if-statement:</h2>\n\n<pre><code>if (data[c] &gt;= 128)\n    sum += data[c];\n</code></pre>\n\n<p>Notice that the data is evenly distributed between 0 and 255. \nWhen the data is sorted, roughly the first half of the iterations will not enter the if-statement. After that, they will all enter the if-statement.</p>\n\n<p>This is very friendly to the branch predictor since the branch consecutively goes the same direction many times.\nEven a simple saturating counter will correctly predict the branch except for the few iterations after it switches direction.</p>\n\n<p><strong>Quick visualization:</strong></p>\n\n<pre><code>T = branch taken\nN = branch not taken\n\ndata[] = 0, 1, 2, 3, 4, ... 126, 127, 128, 129, 130, ... 250, 251, 252, ...\nbranch = N  N  N  N  N  ...   N    N    T    T    T  ...   T    T    T  ...\n\n       = NNNNNNNNNNNN ... NNNNNNNTTTTTTTTT ... TTTTTTTTTT  (easy to predict)\n</code></pre>\n\n<p>However, when the data is completely random, the branch predictor is rendered useless because it can\'t predict random data.\nThus there will probably be around 50% misprediction. (no better than random guessing)</p>\n\n<pre><code>data[] = 226, 185, 125, 158, 198, 144, 217, 79, 202, 118,  14, 150, 177, 182, 133, ...\nbranch =   T,   T,   N,   T,   T,   T,   T,  N,   T,   N,   N,   T,   T,   T,   N  ...\n\n       = TTNTTTTNTNNTTTN ...   (completely random - hard to predict)\n</code></pre>\n\n<hr>\n\n<p><strong>So what can be done?</strong></p>\n\n<p>If the compiler isn\'t able to optimize the branch into a conditional move, you can try some hacks if you are willing to sacrifice readability for performance.</p>\n\n<p>Replace:</p>\n\n<pre><code>if (data[c] &gt;= 128)\n    sum += data[c];\n</code></pre>\n\n<p>with:</p>\n\n<pre><code>int t = (data[c] - 128) &gt;&gt; 31;\nsum += ~t &amp; data[c];\n</code></pre>\n\n<p>This eliminates the branch and replaces it with some bitwise operations.</p>\n\n<p><sub>(Note that this hack is not strictly equivalent to the original if-statement. But in this case, it\'s valid for all the input values of <code>data[]</code>.)</sub></p>\n\n<p><strong>Benchmarks: Core i7 920 @ 3.5 GHz</strong></p>\n\n<p>C++ - Visual Studio 2010 - x64 Release</p>\n\n<pre><code>//  Branch - Random\nseconds = 11.777\n\n//  Branch - Sorted\nseconds = 2.352\n\n//  Branchless - Random\nseconds = 2.564\n\n//  Branchless - Sorted\nseconds = 2.587\n</code></pre>\n\n<p>Java - Netbeans 7.1.1 JDK 7 - x64</p>\n\n<pre><code>//  Branch - Random\nseconds = 10.93293813\n\n//  Branch - Sorted\nseconds = 5.643797077\n\n//  Branchless - Random\nseconds = 3.113581453\n\n//  Branchless - Sorted\nseconds = 3.186068823\n</code></pre>\n\n<p>Observations:</p>\n\n<ul>\n<li><strong>With the Branch:</strong> There is a huge difference between the sorted and unsorted data.</li>\n<li><strong>With the Hack:</strong> There is no difference between sorted and unsorted data.</li>\n<li>In the C++ case, the hack is actually a tad slower than with the branch when the data is sorted.</li>\n</ul>\n\n<p>A general rule of thumb is to avoid data-dependent branching in critical loops. (such as in this example)</p>\n\n<hr>\n\n<p><strong>Update:</strong></p>\n\n<ul>\n<li><p>GCC 4.6.1 with <code>-O3</code> or <code>-ftree-vectorize</code> on x64 is able to generate a conditional move. So there is no difference between the sorted and unsorted data - both are fast.</p></li>\n<li><p>VC++ 2010 is unable to generate conditional moves for this branch even under <code>/Ox</code>.</p></li>\n<li><p>Intel Compiler 11 does something miraculous. It <a href=\"//en.wikipedia.org/wiki/Loop_interchange\" rel=\"noreferrer\">interchanges the two loops</a>, thereby hoisting the unpredictable branch to the outer loop. So not only is it immune the mispredictions, it is also twice as fast as whatever VC++ and GCC can generate! In other words, ICC took advantage of the test-loop to defeat the benchmark...</p></li>\n<li><p>If you give the Intel Compiler the branchless code, it just out-right vectorizes it... and is just as fast as with the branch (with the loop interchange).</p></li>\n</ul>\n\n<p>This goes to show that even mature modern compilers can vary wildly in their ability to optimize code...</p>\n'
        //var s='<p>Okay, I have seen this:\n<a href="https://stackoverflow.com/questions/1129216/sorting-objects-in-an-array-by-a-field-value-in-javascript">Sort array of objects by string property value in JavaScript</a><br>\nNow, my problem is that I want sort the array by a field value in dependence of an external int value.</p>\n\n<p>The Int value represents a number of persons for a reservation, the objects in the array are the tables with the seats.<br></p>\n\n<p>Now, when I got a Reservation with 4 persons the array should beginn with the object where Seats are equal to my Int (the 4 persons) or the nearest higher one. The next ones should be i.e. 6 and 8. Objects with Seats are smaller then my Int should listed at the end (when 4 persons want a reservation, I dont need tables with 2 Seats). I hop its a bit cleare now.</p>\n\n<pre><code>{\n    Area: "Bar",\n    Seats: 2,\n    Id : 1\n},{\n    Area: "Outside",\n    Seats: 8,\n    Id : 2\n},{\n    Area: "Room",\n    Seats: 4,\n    Id : 3\n},{\n    Area: "Floor",\n    Seats: 2,\n    Id : 4\n},{\n    Area: "Room",\n    Seats: 6,\n    Id : 5\n}\n</code></pre>\n\n<p>Okay, here is my solution:<br></p>\n\n<pre><code>        res.sort(function (a, b) {\n            if ((a.Seats &lt; goal)  &amp;&amp;  (b.Seats &lt; goal)) {\n                return b.Seats - a.Seats;\n            }\n            if (a.Seats &lt; goal) {\n                return 1;\n            }\n            if (b.Seats &lt; goal) {\n                return -1;\n            }\n            return a.Seats - b.Seats;\n        });\n</code></pre>\n';
        //var s="<p>The reason why performance improves drastically when the data is sorted is that the branch prediction penalty is removed, as explained beautifully in <a href=\"https://stackoverflow.com/users/922184/mysticial\">Mysticial</a>'s answer.</p>\n\n<p>Now, if we look at the code</p>\n\n<pre><code>if (data[c] &gt;= 128)\n    sum += data[c];\n</code></pre>\n\n<p>we can find that the meaning of this particular <code>if... else...</code> branch is to add something when a condition is satisfied. This type of branch can be easily transformed into a <strong>conditional move</strong> statement, which would be compiled into a conditional move instruction: <code>cmovl</code>, in an <code>x86</code> system. The branch and thus the potential branch prediction penalty is removed.</p>\n\n<p>In <code>C</code>, thus <code>C++</code>, the statement, which would compile directly (without any optimization) into the conditional move instruction in <code>x86</code>, is the ternary operator <code>... ? ... : ...</code>. So we rewrite the above statement into an equivalent one:</p>\n\n<pre><code>sum += data[c] &gt;=128 ? data[c] : 0;\n</code></pre>\n\n<p>While maintaining readability, we can check the speedup factor.</p>\n\n<p>On an Intel <a href=\"http://en.wikipedia.org/wiki/Intel_Core#Core_i7\" rel=\"noreferrer\">Core i7</a>-2600K @ 3.4&nbsp;GHz and Visual Studio 2010 Release Mode, the benchmark is (format copied from Mysticial):</p>\n\n<p><strong>x86</strong></p>\n\n<pre><code>//  Branch - Random\nseconds = 8.885\n\n//  Branch - Sorted\nseconds = 1.528\n\n//  Branchless - Random\nseconds = 3.716\n\n//  Branchless - Sorted\nseconds = 3.71\n</code></pre>\n\n<p><strong>x64</strong></p>\n\n<pre><code>//  Branch - Random\nseconds = 11.302\n\n//  Branch - Sorted\n seconds = 1.830\n\n//  Branchless - Random\nseconds = 2.736\n\n//  Branchless - Sorted\nseconds = 2.737\n</code></pre>\n\n<p>The result is robust in multiple tests. We get a great speedup when the branch result is unpredictable, but we suffer a little bit when it is predictable. In fact, when using a conditional move, the performance is the same regardless of the data pattern.</p>\n\n<p>Now let's look more closely by investigating the <code>x86</code> assembly they generate. For simplicity, we use two functions <code>max1</code> and <code>max2</code>.</p>\n\n<p><code>max1</code> uses the conditional branch <code>if... else ...</code>:</p>\n\n<pre><code>int max1(int a, int b) {\n    if (a &gt; b)\n        return a;\n    else\n        return b;\n}\n</code></pre>\n\n<p><code>max2</code> uses the ternary operator <code>... ? ... : ...</code>:</p>\n\n<pre><code>int max2(int a, int b) {\n    return a &gt; b ? a : b;\n}\n</code></pre>\n\n<p>On a x86-64 machine, <code>GCC -S</code> generates the assembly below.</p>\n\n<pre><code>:max1\n    movl    %edi, -4(%rbp)\n    movl    %esi, -8(%rbp)\n    movl    -4(%rbp), %eax\n    cmpl    -8(%rbp), %eax\n    jle     .L2\n    movl    -4(%rbp), %eax\n    movl    %eax, -12(%rbp)\n    jmp     .L4\n.L2:\n    movl    -8(%rbp), %eax\n    movl    %eax, -12(%rbp)\n.L4:\n    movl    -12(%rbp), %eax\n    leave\n    ret\n\n:max2\n    movl    %edi, -4(%rbp)\n    movl    %esi, -8(%rbp)\n    movl    -4(%rbp), %eax\n    cmpl    %eax, -8(%rbp)\n    cmovge  -8(%rbp), %eax\n    leave\n    ret\n</code></pre>\n\n<p><code>max2</code> uses much less code due to the usage of instruction <code>cmovge</code>. But the real gain is that <code>max2</code> does not involve branch jumps, <code>jmp</code>, which would have a significant performance penalty if the predicted result is not right.</p>\n\n<p>So why does a conditional move perform better?</p>\n\n<p>In a typical <code>x86</code> processor, the execution of an instruction is divided into several stages. Roughly, we have different hardware to deal with different stages. So we do not have to wait for one instruction to finish to start a new one. This is called <strong><a href=\"http://en.wikipedia.org/wiki/Pipeline_%28computing%29\" rel=\"noreferrer\">pipelining</a></strong>.</p>\n\n<p>In a branch case, the following instruction is determined by the preceding one, so we cannot do pipelining. We have to either wait or predict.</p>\n\n<p>In a conditional move case, the execution conditional move instruction is divided into several stages, but the earlier stages like <code>Fetch</code> and <code>Decode</code> does not depend on the result of the previous instruction; only latter stages need the result. Thus, we wait a fraction of one instruction's execution time. This is why the conditional move version is slower than the branch when prediction is easy.</p>\n\n<p>The book <em><a href=\"http://rads.stackoverflow.com/amzn/click/0136108040\" rel=\"noreferrer\">Computer Systems: A Programmer's Perspective, second edition</a></em> explains this in detail. You can check Section 3.6.6 for <em>Conditional Move Instructions</em>, entire Chapter 4 for <em>Processor Architecture</em>, and Section 5.11.2 for a special treatment for <em>Branch Prediction and Misprediction Penalties</em>.</p>\n\n<p>Sometimes, some modern compilers can optimize our code to assembly with better performance, sometimes some compilers can't (the code in question is using Visual Studio's native compiler). Knowing the performance difference between branch and conditional move when unpredictable can help us write code with better performance when the scenario gets so complex that the compiler can not optimize them automatically.</p>\n";
        m=s.split(re);
        for(var i=0; i<m.length; i++){
            if(i%2==0){
                complete.concept.push(m[i]);
            }else{
                complete.code.push(m[i]);
            }
        }
        complete.is_code = complete.code.length > 0;
        for(var i=0; i<complete.concept.length;i++){
            while(re2.test(complete.concept[i])){
                complete.concept[i]=complete.concept[i].replace(re2," ");
            }
            while(/\n|\r/g.test(complete.concept[i])){
                complete.concept[i]=complete.concept[i].replace(/\n|\r/g," ");
            }
        }
        //console.log(complete);
        callback(complete);
    });
}

//  --------------------------------------------------------------------------------------------
const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    // TODO
    'Search': function () {
        const param = this.event.request.intent.slots.stackquery.value;
        let fake_speech = "";

        // TODO SEARCH
        // TODO SUMMARIZE

        // HARDCODED
        
        if (param === "which equals operator should be used in JavaScript comparisons") {
            fake_speech = "The identity (===) operator behaves identically to the equality (==) operator except no type conversion is done, and the types must be the same to be considered equal.";
        } else if (param === "what is the difference between git pull and git fetch") {
            fake_speech = "In the simplest terms, git pull does a git fetch followed by a git merge. You can do a git fetch at any time to update your remote-tracking branches under refs/remotes/your remote id/.";
        } else if (param === "how do I validate an email address in JavaScript using regex") {
           fake_speech = "Using regular expressions is probably the best way, I'll text you a link to a code snippet now!";
            twilioclient.messages
                .create({
                to: '+15192398181',
                from: '+12892040756',
                body: ```'function validateEmail(email) {
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(String(email).toLowerCase());
                }```,
            }).then((message) => console.log(message.sid));
        }
        if (fake_speech != "") {
            self.response.speak(fake_speech);
            self.emit(':responseReady');
            return;
        }
        //this is temproary
        const self = this;

        jsonapi(param, function (data) {
        var speech;

                if (data.code != null){
                    speech = "I'll text you a link to a code snippet now!";
            twilioclient.messages.create({
                to: '+15192398181',
                from: '+12892040756',
                body: data.code[0]
                })};

                self.response.speak(data.concept[0]);
                self.emit(':responseReady');
            });
        //});

        //console.log(data.concept[0]);
        /*this.response.speak(speech);
        this.emit(':responseReady');*/
        
        // if predefined, we exit early
         //f (param != "") {
            // this.response.speak(speech);
             //this.emit(':responseReady');
             //return; 
        //}
        // else we bind the context to the function
        //jsonapi.bind(this);
        //jsonapi(param, function (data) {
          //  speech = data.concept.join(" ");
            //this.response.speak(speech);
            //this.emit(':responseReady');
        //});
     //a0dc57e6bab505c2d0a3058105c8e9462c142f3c
    },
    
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak("Goodbye!");
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};