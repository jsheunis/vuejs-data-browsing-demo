/********/
// Data //
/********/

const data_dir = './data';

/**************/
// Components //
/**************/

// Component definition: dataset view
const datasetView = {
  template: "#dataset-template",
  props: {
    "selectedDataset": Object
  },
  data: function() {
    return {
      tabIndex: 0,
      subdatasets_ready: false,
    };
  },
  methods: {
    selectDataset(obj, objId) {
      this.subdatasets_ready = false;
      did = obj.id
      router.push({ name: 'dataset', params: { dataset_id: did } })
    }
  },
  async beforeRouteUpdate(to, from, next) {
    console.log('async beforeRouteUpdate start from datasetView component')
    file = data_dir + '/' + to.params.dataset_id + '.json'
    response = await fetch(file);
    text = await response.text();
    this.$root.selectedDataset = JSON.parse(text);

    if (this.$root.selectedDataset.hasOwnProperty("subdatasets")
        && this.$root.selectedDataset.subdatasets instanceof Array
        && this.$root.selectedDataset.subdatasets.length > 0) {
      
      subds_json = await grabSubDatasets(this.$root);
      console.log('async beforeRouteUpdate AFTER grabdatasets function')
      subds_json.forEach(
        (subds, index) => {
          console.log(subds_json[index].dataset_id)
          this.$root.selectedDataset.subdatasets[index].description = subds_json[index].description;
          this.$root.selectedDataset.subdatasets[index].name = subds_json[index].name;
        }
      );
      this.subdatasets_ready = true;
      console.log('async beforeRouteUpdate AFTER forEach assignment')
    }
    next();
  },
  beforeUpdate() {
    console.log('beforeUpdate start from datasetView component (does nothing)')
  },
  async created () {
    console.log('async created: from datasetView component')
    file = data_dir + '/' + this.$route.params.dataset_id + '.json'
    var app = this.$root;
    response = await fetch(file);
    text = await response.text();
    app.selectedDataset = JSON.parse(text);
    subds_json = await grabSubDatasets(app);
    console.log('async created AFTER grabdatasets function')
    subds_json.forEach(
      (subds, index) => {
        console.log(subds_json[index].dataset_id)
        this.$root.selectedDataset.subdatasets[index].description = subds_json[index].description;
        this.$root.selectedDataset.subdatasets[index].name = subds_json[index].name;
      }
    );
    this.subdatasets_ready = true;
    console.log('async created AFTER forEach assignment')
  },
  mounted() {
    console.log('mounted start from datasetView component (does nothing)')
  }
};

// Component definition: main view
const mainPage = {
  template: "#main-template",
  data: function() {
    return {
    };
  },
  methods: {
  },
};

// Component definition: 404 view
const notFound = {
  template: '<img src="artwork/404.svg" class="d-inline-block align-middle" alt="404-not-found" style="width:70%;">',
}


/**********/
// Router //
/**********/

// Router routes definition
const routes = [
  { path: '/dataset/:dataset_id', component: datasetView, name: 'dataset'},
  { path: '/about', component: mainPage, name: 'about' },
  { path: '*', component: notFound, name: '404' },
  { path: '/', component: mainPage, name: 'home',
    // When navigating to main page, navigate to super dataset
    beforeEnter: (to, from, next) => {
      console.log('route beforeEnter: main page')
      const superfile = data_dir + '/toplevel.json';
      var rawFile = new XMLHttpRequest(); // https://www.dummies.com/programming/php/using-xmlhttprequest-class-properties/
      rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                superds = JSON.parse(allText);
                console.log("Navigating to super dataset page")
                router.push({ name: 'dataset', params: { dataset_id: superds.id } })
                next();
            } else if (rawFile.status === 404) {
              router.push({ name: '404'})
            } else {
              // TODO: figure out what to do here
            }
        }
      }
      rawFile.open("GET", superfile, false);
      rawFile.send();
    }
  }
];

// Create router
const router = new VueRouter({
  routes: routes,
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0, behavior: 'auto' };
  }
});


/***********/
// Vue app //
/***********/

// Start Vue instance
var demo = new Vue({
  el: "#demo",
  data: {
      selectedDataset: {},
  },
  methods: {
  },
  beforeMount(){
  },
  router
});

/*************/
// Functions //
/*************/

async function grabSubDatasets(app) {
  subds_json = [];
  await Promise.all(app.selectedDataset.subdatasets.map(async (subds, index) => {
    did = subds.id
    subds_file = data_dir + '/' + did + '.json';
    subds_response = await fetch(subds_file);
    subds_text = await subds_response.text();
    subds_json[index] = JSON.parse(subds_text);
  }));
  console.log('inside async grabdatasets function')
  return subds_json
}