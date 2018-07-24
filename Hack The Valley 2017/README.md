# StackSearch [![Build Status](https://travis-ci.org/stack-Search/StackSearch.svg?branch=master)](https://travis-ci.org/stack-Search/StackSearch)

StackSearch is a skill for Alexa that integrates the StackOverflow and Twilio API to answer developer's questions hands-free!

Currently in a semi-functional state.

## Build Instructions (Very High Level)

1. Create an Alexa skill (us-east-1 region)

1. Copy AWS_Files/alexa_skill.json for the Skill's behaviour.

1. Fork this repo

1. Add this repo to your TravisCI

1. Change our public key / ID to your keys.

1. Git push!

TravisCI should handle most of the deploy, and after that you just need to make sure you've published your AWS Lambda function, and add your Alexa skill ID as a trigger.

On the Alexa side, you must ensure that the default endpoint for the skill you created is the same as your **published** Lambda function (including version number).

## Attribution

This was made by @johnaoss, @rohilG, @garobles, and @rbangamm at Hack the Valley 2 from February 23rd-25th 2018 in UTSC.

## License

WTFPL 
