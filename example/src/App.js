import React, {useState} from 'react';

import {SbxCoreService, SbxSessionService} from 'sbx-axios';

const sbxCoreService = new SbxCoreService();
const sbxSessionService = new SbxSessionService(sbxCoreService);
sbxSessionService.initialize(process.env.REACT_APP_DOMAIN, process.env.REACT_APP_APP_KEY);
sbxCoreService.addHeaderAttr('authorization', 'Bearer ' + process.env.REACT_APP_TOKEN);

const App = () => {
  const [data, setData] = useState('{}');
  sbxCoreService.with('app').loadAll().then(res => {
    setData(JSON.stringify(res));
  });

  return (
    <code>
      {data}
    </code>
  );
};

export default App;
