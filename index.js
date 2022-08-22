// Copyright (c)2022 Quinn Michaels
// The Adventure Deva
const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const ADVENTURE = new Deva({
  agent: {
    uid: agent.uid,
    key: agent.key,
    name: agent.name,
    describe: agent.describe,
    prompt: agent.prompt,
    voice: agent.voice,
    profile: agent.profile,
    translate(input) {
      return input.trim();
    },
    parse(input) {
      return input.trim();
    }
  },
  vars,
  listeners: {},
  modules: {},
  deva: {},
  func: {
    /**************
    func: getAdvFile
    params: opts - optsion object
    describe: The getAdvFile function will take a string and then pull the corresponding
    adventure file from the designated location set in the data.config file.
    ***************/
    getAdvFile(opts) {
      let advFile, advPath, dir1, dir2
      const thing = opts.meta.params[0];
      const adv = opts.meta.params[1];
      const ident = opts.text.split('/');
      let room = ident[0];
      const sec = ident[1] ? ident[1].split(':') : [];

      room = room.length == 1 ? `000${room}` : room;
      room = room.length == 2 ? `00${room}` : room;
      room = room.length == 3 ? `0${room}` : room;

      const doc = sec[0] ? sec[0].toLowerCase() : 'main';
      const section = sec[1] ? sec[1].toUpperCase() : 'MAIN';

      return new Promise((resolve, reject) => {

      switch (thing) {
        case 'help':
          advPath = path.join(__dirname, 'data', adv, thing, `${data.text}.feecting`);
          this.prompt(`ADV File: ${advPath}`);
          return resolve(fs.readFileSync(advPath, 'utf8'));
        default:
          dir1 = room.substr(0, room.length - 3) + 'xxx';
          dir2 = room.substr(0, room.length - 2) + 'xx';
          advPath = `${this.vars.url}/${adv}/${thing}/${dir1}/${dir2}/${room}/${doc}.feecting`;

          this.question(`#web get ${advPath}`).then(result => {
            const text = result.a.text.toString('utf8').split(`::BEGIN:${section}`)[1].split(`::END:${section}`)[0];

            resolve({
              text: text,
              html: text,
              data: {advPath},
            })
          }).catch(reject)
        }
      });
    },

    /**************
    func: view
    params: data
    describe: The view function will pass in a data object that will then call the
    getAdvFile function to pull the profper adventure file then pass it off to
    feecting for parsing before return.
    ***************/
    view(data) {
      return new Promise((resolve, reject) => {
        this.func.getAdvFile(data.q).then(advFile => {
          return this.question(`#feecting parse:${data.q.meta.params[0]}:${data.q.meta.params[1]} ${advFile.text}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          })
        });
      });
    },
  },
  methods: {
    /**************
    method: hash
    params: packet
    describe: The hash method exposes the hash function which calls the core
    hash features to become available to the Adventure Deva.
    ***************/
    hash(packet) {
      return this.hash(packet);
    },

    /**************
    method: world
    params: packet
    describe: Call a world file from the adventure server.
    ***************/
    world(packet) {
      return this.func.view(packet);
    },

    /**************
    method: object
    params: packet
    describe: Call an objext file from the adventure server
    ***************/
    object(packet) {
      return this.func.view(packet);
    },

    /**************
    method: agent
    params: packet
    describe: Call an Agent file from the adventure server
    ***************/
    agent(packet) {
      return this.func.view(packet);
    },

    /**************
    method: uid
    params: packet
    describe: Return a system uid to the Adventure Deva.
    ***************/
    uid(packet) {
      return Promise.resolve(this.uid());
    },

    /**************
    method: status
    params: packet
    describe: Return the current status of the Adventure Deva.
    ***************/
    status(packet) {
      return this.status();
    },

    /**************
    method: help
    params: packet
    describe: Read the help files for the Adventure Deva method.
    ***************/
    help(packet) {
      return new Promise((resolve, reject) => {
        this.lib.help(packet.q.text, __dirname).then(help => {
          return this.question(`#feecting parse ${help}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          });
        }).catch(reject);
      });
    },
  },
});
module.exports = ADVENTURE
