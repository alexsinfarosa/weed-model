import AppStore from "./appStore";
const fetcher = url => window.fetch(url).then(response => response.json());

const store = {
  app: new AppStore(fetcher)
};

export default store;

// store.app.loadSubjects();
// store.app.loadStates();
// store.app.loadStations();
// store.app.loadGridData();
