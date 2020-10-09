import React, {Fragment, useState} from 'react';
import env from './Environment';
import {SbxCoreService, SbxSessionService} from 'sbx-axios';

const sbxCoreService = new SbxCoreService();
const sbxSessionService = new SbxSessionService(sbxCoreService);
sbxSessionService.initializeWithEnvironment(env);

const App = () => {sbxSessionService.updateToken(env.token);
  sbxCoreService.with('app').loadAll().then(res => {
    setData(JSON.stringify(res));
  });
  const [data, setData] = useState('{}');



  return (
    <Fragment>
      <code>
        {data}
      </code>
    </Fragment>
  );
};

export default App;
