import React from 'react';
import GeoMan from 'geoman-client';

class App extends React.Component {
  state = {
    districts: [],
    subdistricts: [],
    neighbors: [],
    basemaps: [],
    active_basemaps: [],
    active_style: GeoMan.Styles.DARK,
    s_d: null,
    s_s: null,
    regionPanel: false,
    loading: false
  }
  componentDidMount() {
    const host = process.env.REACT_APP_MAP_HOST ? process.env.REACT_APP_MAP_HOST : 'http://localhost';
    const port = process.env.REACT_APP_MAP_PORT ? process.env.REACT_APP_MAP_PORT : 8080;
    this.geoman = new GeoMan(host, port, {
      container: 'map',
      center: [124.842624, 1.4794296],
      zoom: 14,
      maxZoom: 17
    }, this.state.active_style);
    this.geoman.setReadyCallback(() => {
      this.geoman.getDistricts().then((districts) => this.setState({ districts }));
      this.geoman.getBasemaps().then((basemaps) => this.setState({ basemaps }));
      this.setDistrictLabelEvent();
      this.setSubdistrictLabelEvent();
      this.setNeighborLabelEvent();
    });
  }
  fetchSubdistrict(d) {
    this.setState({ subdistricts: [] }, () => {
      d.getSubdistricts().then((subdistricts) => this.setState({ subdistricts }));
    });
  }
  fetchNeighbors(s) {
    this.setState({ neighbors: [] }, () => {
      s.getNeighbors().then((neighbors) => this.setState({ neighbors }));
    });
  }
  setDistrictLabelEvent() {
    this.geoman.setRegionLabelEvent('click', 'district', (feature) => {
      this.setCursorLoading(true);
      this.geoman.getDistrict(feature.properties.id).then((district) => {
        district.focus().then(() => this.setCursorLoading(false));
      });
    });
    this.geoman.setRegionLabelEvent('mousemove', 'district', (feature, ev) => {
      const area = feature.properties.area;
      this.info.style.display = 'block';
      this.info.style.top = `${ev.originalEvent.clientY - 60}px`;
      this.info.style.left = `${ev.originalEvent.clientX}px`;
      this.info.innerHTML = `
        <b>Wilayah</b> : ${feature.properties.name}<br />
        <b>Luas</b> : ${Math.round(area * 100) / 100} m²
      `;
    });
    this.geoman.setRegionLabelEvent('mouseleave', 'district', () => {
      this.info.style.display = 'none';
    });
  }
  setSubdistrictLabelEvent() {
    this.geoman.setRegionLabelEvent('click', 'subdistrict', (feature) => {
      this.setCursorLoading(true);
      this.geoman.getSubdistrict(feature.properties.district_id, feature.properties.id).then((subdistrict) => {
        subdistrict.focus().then(() => this.setCursorLoading(false));
      });
    });
    this.geoman.setRegionLabelEvent('mousemove', 'subdistrict', (feature, ev) => {
      const area = feature.properties.area;
      this.info.style.display = 'block';
      this.info.style.top = `${ev.originalEvent.clientY - 60}px`;
      this.info.style.left = `${ev.originalEvent.clientX}px`;
      this.info.innerHTML = `
        <b>Wilayah</b> : ${feature.properties.name} - ${feature.properties.district}<br />
        <b>Luas</b> : ${Math.round(area * 100) / 100} m²
      `;
    });
    this.geoman.setRegionLabelEvent('mouseleave', 'subdistrict', () => {
      this.info.style.display = 'none';
    });
  }
  setNeighborLabelEvent() {
    this.geoman.setRegionLabelEvent('click', 'neighbor', (feature) => {
      this.setCursorLoading(true);
      this.geoman.getNeighbor(feature.properties.district_id, feature.properties.subdistrict_id, feature.properties.id).then((neighbor) => {
        neighbor.focus().then(() => this.setCursorLoading(false));
      });
    });
    this.geoman.setRegionLabelEvent('mousemove', 'neighbor', (feature, ev) => {
      const area = feature.properties.area;
      this.info.style.display = 'block';
      this.info.style.top = `${ev.originalEvent.clientY - 60}px`;
      this.info.style.left = `${ev.originalEvent.clientX}px`;
      this.info.innerHTML = `
        <b>Wilayah</b> : ${feature.properties.name} - ${feature.properties.subdistrict} - ${feature.properties.district}<br />
        <b>Luas</b> : ${Math.round(area * 100) / 100} m²
      `;
    });
    this.geoman.setRegionLabelEvent('mouseleave', 'neighbor', () => {
      this.info.style.display = 'none';
    });
  }
  setCursorLoading(status) {
    this.setState({
      loading: status
    });
  }
  render() {
    const { districts, subdistricts, neighbors, basemaps } = this.state;
    return (
      <div className="App">
        <div id="info-popover" ref={(e) => this.info = e}>
          lorem ipsum
        </div>
        <div id="loading" className={this.state.loading ? 'show' : ''}>
          <i className="fa fa-cog fa-spin"></i>
        </div>
        <div id="map"></div>
        <div className="main-header">
          <img src={require('./images/logo-pemkot_rev.png')} width="60%" />
        </div>
        <div className={`control region ${this.state.regionPanel ? 'show' : ''}`}>
          <div className="control-head">
            Wilayah
          </div>
          <ul className="parent-list">
            {districts.map((d, i) => (
              <li key={i}>
                {d.name} [<a href="#" onClick={() => {
                  this.setCursorLoading(true);
                  d.focus().then(() => this.setCursorLoading(false));
                }}>focus</a>] [<a href="#" onClick={() => {
                  const { s_d } = this.state;
                  if (s_d === d.id) {
                    this.setState({ s_d: null });
                  } else {
                    this.setState({
                      s_d: d.id,
                    }, () => this.fetchSubdistrict(d));
                  }
                }}>{this.state.s_d === d.id ? 'collapse' : 'expand'}</a>]
                  <ul>
                  {this.state.s_d === d.id && subdistricts.map((s, j) => (
                    <li key={j}>
                      {s.name} [<a href="#" onClick={() => {
                        this.setCursorLoading(true);
                        s.focus().then(() => this.setCursorLoading(false));
                      }}>focus</a>] [<a href="#" onClick={() => {
                        const { s_s } = this.state;
                        if (s_s === s.id) {
                          this.setState({ s_s: null });
                        } else {
                          this.setState({
                            s_s: s.id,
                          }, () => this.fetchNeighbors(s));
                        }
                      }}>{this.state.s_s === s.id ? 'collapse' : 'expand'}</a>] 
                        <ul>
                        {this.state.s_s === s.id && neighbors.map((n, k) => (
                          <li key={k}>{n.name} [<a href="#" onClick={() => {
                            this.setCursorLoading(true);
                            n.focus().then(() => this.setCursorLoading(false));
                          }}>focus</a>]</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <div className="control-head">
            Basemap
          </div>
          <ul className="parent-list">
            {basemaps.map((b, i) => (
              <li key={i}>{b.name} [<a onClick={() => {
                const { active_basemaps } = this.state;
                if (active_basemaps.indexOf(b.id) !== -1) {
                  b.hide();
                  active_basemaps.splice(active_basemaps.indexOf(b.id), 1);
                } else {
                  b.show();
                  active_basemaps.push(b.id);
                }
                this.setState({ active_basemaps });
              }} href="#">{this.state.active_basemaps.indexOf(b.id) !== -1 ? 'hide' : 'show'}</a>]</li>
            ))}
          </ul>
          <div className="control-toggle" onClick={() => this.setState({ regionPanel: !this.state.regionPanel })}>Wilayah & Basemap</div>
        </div>
        <div className="style-options">
          <ul>
            {Object.keys(GeoMan.Styles).map((s, i) => (
              <li className={this.state.active_style === s ? 'active' : ''} key={i} onClick={() => {
                this.setState({ active_style: s, active_basemaps: [] });
                this.geoman.setStyle(s);
              }}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

export default App;
