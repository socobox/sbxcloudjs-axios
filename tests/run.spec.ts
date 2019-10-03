import 'mocha';
import jsdom from 'mocha-jsdom';
import {SbxCoreService, SbxSessionService} from "../src";

const sbxCoreService = new SbxCoreService();
const sbxSessionService = new SbxSessionService(sbxCoreService);

describe('Testing Cloud Scripts', function() {
  jsdom({url: "http://localhost"});

  before(() => {
    sbxSessionService.initialize(96, '598c9de4-6ef5-11e6-8b77-86f30ca893d3');
  });

  it('Running', function() {
    sbxSessionService.updateToken('85f4fd84-19c8-4483-bf0a-ded5c2ba9ee8');
    sbxCoreService.insert('app', {config: 'hello'}).then(res => console.log(res));
    sbxCoreService.with('app').insert({config: 'world'}).then(res => console.log(res));
    //sbxCoreService.run('AEDA2445-1C08-4B47-9D55-3BCE1373DB74', {token: '85f4fd84-19c8-4483-bf0a-ded5c2ba9ee8'}, false).then(res => console.log(res));
  });
});
