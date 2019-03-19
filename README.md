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


### To run from an ec2 instance
pick ubuntu 18.04

Update
```
sudo apt update; sudo apt upgrade -y; sudo reboot;
```
Install node
```
sudo apt install -y nodejs; sudo apt install -y npm;
```
Download project
```
sudo apt install -y git; git clone https://github.com/gbradthompson/subreddit-relation-network.git;
```
Build
```
cd subreddit-relation-network; npm install; npm run build;
```
pm2
```
sudo npm install pm2 -g
pm2 startup
pm2 start npm --name "app" -- start
pm2 restart app
```
Setup nginx
```
sudo apt install nginx
sudo rm /etc/nginx/sites-available/default
sudo vim /etc/nginx/sites-available/default

server {
  listen 80 default_server;
  listen [::]:80 default_server ipv6only=on;

  server_name _;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
   }
}

[esc] :wq

sudo nginx -t

sudo /etc/init.d/nginx reload
```

update security vulnerabilities.
