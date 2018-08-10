# subreddit-relation-network

> Nuxt.js + Vuetify.js project

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
$ aws s3 cp ./dist s3://bucket --recursive
```

``` bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -; sudo apt-get install -y nodejs; sudo apt-get install -y build-essential; sudo apt-get install git; git clone https://github.com/gbradthompson/subreddit-relation-network.git; cd "./subreddit-relation-network"; npm install;

screen
npm run generate

sudo apt-get install -y python3-pip; pip3 install awscli --upgrade --user;

aws s3 cp ./dist s3://reddit.guide --recursive
```

For detailed explanation on how things work, check out the [Nuxt.js](https://github.com/nuxt/nuxt.js) and [Vuetify.js](https://vuetifyjs.com/) documentation.
