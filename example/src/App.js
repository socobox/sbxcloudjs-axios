import React, {Fragment, useState} from 'react';
import env from './Environment';
import {SbxCoreService, SbxSessionService} from 'sbx-axios';

const sbxCoreService = new SbxCoreService();
const sbxSessionService = new SbxSessionService(sbxCoreService);
sbxSessionService.initializeWithEnvironment(env);

const App = () => {
  const [data, setData] = useState('{}');
  const [login, setLogin] = useState('{}');

  if (login === '{}') {
    sbxSessionService.login(env.user, env.password).then(res => {
      setLogin(JSON.stringify(res));
      sbxCoreService.with('app').loadAll().then(res => {
        setData(JSON.stringify(res));

        const first = res.results[0];
        first.name = 'testing update => ' + Math.random();
        delete first._META;
        sbxCoreService.with('app').update(first).then();
        first.name = 'testing insert => ' + Math.random();
        delete first._KEY;
        sbxCoreService.with('app').insert(first).then();

        const query = sbxCoreService.with('app');
        query.getModel(console.log).andWhereIsEqualTo('config', 'asd').loadAll().then();

      });
    });
  }

  return (
    <Fragment>
      <code>
        {login}
      </code>
      <code>
        {data}
      </code>
    </Fragment>
  );
};

export default App;
