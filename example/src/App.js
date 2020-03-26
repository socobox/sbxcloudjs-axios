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
