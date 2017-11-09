import { observable, action, when, computed } from "mobx";
import axios from "axios";
import format from "date-fns/format";
import isAfter from "date-fns/is_after";
import isBefore from "date-fns/is_before";

export default class appStore {
  constructor(fetch) {
    this.fetch = fetch;
    // when(() => this.subjects.length === 0, () => this.loadSubjects());
    when(() => this.states.length === 0, () => this.loadStates());
    when(() => this.stations.length === 0, () => this.loadStations());
    when(() => this.gridData.length === 0, () => this.loadGridData());
  }

  // Logic ------------------------------------------------------------------
  @observable
  breakpoints = {
    xs: "(max-width: 767px)",
    su: "(min-width: 768px)",
    sm: "(min-width: 768px) and (max-width: 991px)",
    md: "(min-width: 992px) and (max-width: 1199px)",
    mu: "(min-width: 992px)",
    lg: "(min-width: 1200px)"
  };

  @observable protocol = window.location.protocol;

  @observable isLoading = false;

  @computed
  get areRequiredFieldsSet() {
    if (this.subject && this.state && this.station) {
      return (
        Object.keys(this.state).length !== 0 &&
        Object.keys(this.station).length !== 0
      );
    }
    return false;
  }

  @observable isMobile = window.matchMedia("(max-width: 480px)").matches; // FIX IT
  @action
  closeSidebar = () => {
    if (this.areRequiredFieldsSet && this.isMobile) {
      this.toggleSidebar();
    }
  };

  @observable isSidebarCollapsed = false;
  @action setSidebar = d => (this.isSidebarCollapsed = d);
  @action
  toggleSidebar = () => (this.isSidebarCollapsed = !this.isSidebarCollapsed);

  @observable
  isMap = JSON.parse(localStorage.getItem("state")) === null ? true : false;
  @action setIsMap = d => (this.isMap = d);
  @computed
  get viewMap() {
    return this.isMap ? true : this.areRequiredFieldsSet ? false : true;
  }
  @action toggleMap = () => (this.isMap = !this.isMap);

  @observable isTable = true;
  @computed
  get viewTable() {
    return this.isTable && this.areRequiredFieldsSet;
  }
  @action setIsTable = d => (this.isTable = d);
  @action toggleTable = d => (this.isTable = !this.isTable);

  @observable isGraph = false;
  @action toggleGraph = d => (this.isGraph = !this.isGraph);

  @observable
  isUserTable = JSON.parse(localStorage.getItem("weedModelUserTable")) ===
    null || JSON.parse(localStorage.getItem("weedModelUserTable")).length === 0
    ? false
    : true;
  @action toggleUserTable = d => (this.isUserTable = !this.isUserTable);

  // Subject ------------------------------------------------------------------
  @observable subjects = [];
  @action updateSubjects = d => (this.subjects = d);

  @action
  loadSubjects() {
    this.isLoading = true;
    this.fetch("species.json")
      .then(json => {
        this.updateSubjects(json);
        this.isLoading = false;
      })
      .catch(err => {
        console.log("Failed to load subjects", err);
      });
  }

  @observable subject = JSON.parse(localStorage.getItem("subject")) || {};

  @action
  setSubject = d => {
    this.subject = this.subjects.find(subject => subject.name === d);
    localStorage.setItem(`subject`, JSON.stringify(this.subject));
  };

  // States -------------------------------------------------------------------
  @observable states = [];
  @action updateStates = d => (this.states = d);

  @action
  loadStates() {
    this.isLoading = true;
    this.fetch("states.json")
      .then(json => {
        this.updateStates(json);
        this.isLoading = false;
      })
      .catch(err => {
        console.log("Failed to load states", err);
      });
  }

  @observable
  state = JSON.parse(localStorage.getItem("state")) || {
    postalCode: "ALL",
    lat: 42.5,
    lon: -75.7,
    zoom: 6,
    name: "All States"
  };

  @action
  setState = d => {
    this.station = {};
    this.state = this.states.find(state => state.name === d);
    localStorage.setItem("state", JSON.stringify(this.state));
  };

  @action
  setStateFromMap = d => {
    this.state = this.states.find(state => state.postalCode === d);
    localStorage.setItem("state", JSON.stringify(this.state));
  };

  // Stations -----------------------------------------------------------------
  @observable stations = [];
  @action updateStations = d => (this.stations = d);

  @action
  loadStations() {
    this.isLoading = true;
    return axios
      .get(
        `${this.protocol}//newa2.nrcc.cornell.edu/newaUtil/stateStationList/all`
      )
      .then(res => {
        // console.log(res.data.stations);
        this.updateStations(res.data.stations);
        this.isLoading = false;
      })
      .catch(err => {
        console.log("Failed to load stations", err);
      });
  }

  @computed
  get currentStateStations() {
    return this.stations.filter(
      station => station.state === this.state.postalCode
    );
  }

  @observable station = JSON.parse(localStorage.getItem("station")) || {};
  @action
  setStation = d => {
    this.station = this.stations.find(station => station.name === d);

    localStorage.setItem("station", JSON.stringify(this.station));
  };

  // Dates---------------------------------------------------------------------
  @observable endDate = format(new Date(), "YYYY-MM-DD");
  @action setEndDate = d => (this.endDate = format(d, "YYYY-MM-DD"));
  @computed
  get currentYear() {
    return format(this.endDate, "YYYY");
  }
  @computed
  get startDate() {
    return `${this.currentYear}-03-01`;
  }
  @computed
  get isSeason() {
    return (
      isAfter(this.endDate, this.startDate) &&
      isBefore(this.endDate, `${this.currentYear}-09-30`)
    );
  }

  // Load Grid Data --------------------------------------------------------------
  @observable gridData = [];
  @action updateGridData = d => (this.gridData = d);

  @action
  loadGridData = (sdate = this.startDate, edate = this.endDate) => {
    if (this.areRequiredFieldsSet) {
      this.isLoading = true;

      let loc = "-75.7,42.5";
      if (this.state.name !== "All States") {
        loc = `${this.station.lon},${this.station.lat}`;
      }

      const params = {
        loc: loc,
        sdate: sdate,
        edate: edate,
        grid: 3,
        elems: [{ name: "avgt" }]
      };

      // console.log(params);

      return axios
        .post(`${this.protocol}//grid.rcc-acis.org/GridData`, params)
        .then(res => {
          // console.log(res.data.data);
          this.updateGridData(res.data.data);
          this.isLoading = false;
        })
        .catch(err => {
          console.log("Failed to load grid data", err);
        });
    }
    return [];
  };

  // Current Model ----------------------------------------------------------------
  @action
  degreeDay = (day, base = 48.2) => {
    return day[1] - base > 0 ? Math.round(day[1] - base) : 0;
  };

  @computed
  get crabgrass() {
    let cdd = 0;
    let results = [];
    this.gridData.forEach((day, i) => {
      const dd = this.degreeDay(day);
      cdd += dd;
      let indexMinus2;
      if (i > 1) indexMinus2 = results[i - 2].index;
      results.push({
        name: "Large crabgrass",
        date: day[0],
        cdd: cdd,
        index: Math.round(100 / (1 + Math.exp(19.44 - 3.06 * Math.log(cdd)))),
        indexMinus2: indexMinus2
      });
    });
    return results;
  }

  @computed
  get gFoxtail() {
    let cdd = 0;
    let results = [];
    this.gridData.forEach((day, i) => {
      const dd = this.degreeDay(day);
      cdd += dd;
      let indexMinus2;
      if (i > 1) indexMinus2 = results[i - 2].index;
      results.push({
        name: "Giant foxtail",
        date: day[0],
        cdd: cdd,
        index: Math.round(100 / (1 + Math.exp(18.05 - 3.06 * Math.log(cdd)))),
        indexMinus2: indexMinus2
      });
    });
    return results;
  }

  @computed
  get yFoxtail() {
    let cdd = 0;
    let results = [];
    this.gridData.forEach((day, i) => {
      const dd = this.degreeDay(day);
      cdd += dd;
      let indexMinus2;
      if (i > 1) indexMinus2 = results[i - 2].index;
      results.push({
        name: "Yellow foxtail",
        date: day[0],
        cdd: cdd,
        index: Math.round(100 / (1 + Math.exp(19.46 - 3.31 * Math.log(cdd)))),
        indexMinus2: indexMinus2
      });
    });
    return results;
  }

  @computed
  get lambsquarters() {
    let cdd = 0;
    let results = [];
    this.gridData.forEach((day, i) => {
      const dd = this.degreeDay(day);
      cdd += dd;
      let indexMinus2;
      if (i > 1) indexMinus2 = results[i - 2].index;
      results.push({
        name: "Common lambsquarters",
        date: day[0],
        cdd: cdd,
        index: Math.round(100 / (1 + Math.exp(11.69 - 1.9 * Math.log(cdd)))),
        indexMinus2: indexMinus2
      });
    });
    return results;
  }

  @computed
  get nightshade() {
    let cdd = 0;
    let results = [];
    this.gridData.forEach((day, i) => {
      const dd = this.degreeDay(day);
      cdd += dd;
      let indexMinus2;
      if (i > 1) indexMinus2 = results[i - 2].index;
      results.push({
        name: "Eastern black nightshade",
        date: day[0],
        cdd: cdd,
        index: Math.round(100 / (1 + Math.exp(27.93 - 4.18 * Math.log(cdd)))),
        indexMinus2: indexMinus2
      });
    });
    return results;
  }

  @computed
  get pigweed() {
    let cdd = 0;
    let results = [];
    this.gridData.forEach((day, i) => {
      const dd = this.degreeDay(day);
      cdd += dd;
      let indexMinus2;
      if (i > 1) indexMinus2 = results[i - 2].index;
      results.push({
        name: "Smooth pigweed",
        date: day[0],
        cdd: cdd,
        index: Math.round(100 / (1 + Math.exp(20.06 - 3.12 * Math.log(cdd)))),
        indexMinus2: indexMinus2
      });
    });
    return results;
  }

  @computed
  get ragweed() {
    let cdd = 0;
    let results = [];
    this.gridData.forEach((day, i) => {
      const dd = this.degreeDay(day);
      cdd += dd;
      let indexMinus2;
      if (i > 1) indexMinus2 = results[i - 2].index;
      results.push({
        name: "Common ragweed",
        date: day[0],
        cdd: cdd,
        index: Math.round(100 / (1 + Math.exp(12.93 - 2.63 * Math.log(cdd)))),
        indexMinus2: indexMinus2
      });
    });
    return results;
  }

  @computed
  get velvetleaf() {
    let cdd = 0;
    let results = [];
    this.gridData.forEach((day, i) => {
      const dd = this.degreeDay(day);
      cdd += dd;
      let indexMinus2;
      if (i > 1) indexMinus2 = results[i - 2].index;
      results.push({
        name: "Velvetleaf",
        date: day[0],
        cdd: cdd,
        index: Math.round(100 / (1 + Math.exp(18.86 - 3.21 * Math.log(cdd)))),
        indexMinus2: indexMinus2
      });
    });
    return results;
  }

  // Graph ----------------------------------------------------------------------
  @computed
  get graphData() {
    if (this.gridData) {
      return this.gridData.map((day, i) => {
        return {
          date: format(day[0], "MMM D"),
          "Large crabgrass": this.crabgrass[i].index,
          "Giant foxtail": this.gFoxtail[i].index,
          "Yellow foxtail": this.yFoxtail[i].index,
          "Common lambsquarters": this.lambsquarters[i].index,
          "Eastern black nightshade": this.nightshade[i].index,
          "Smooth pigweed": this.pigweed[i].index,
          "Common ragweed": this.ragweed[i].index,
          Velvetleaf: this.velvetleaf[i].index
        };
      });
    }
    return [];
  }
}
