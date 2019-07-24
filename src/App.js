import React from 'react';
import GeoMan from 'geoman-client';

class App extends React.Component {
  state = {
    districts: [],
    subdistricts: [],
    neighbors: [],
    basemaps: [],
    active_basemaps: [],
    active_style: GeoMan.Styles.WORLD,
    s_d: null,
    s_s: null
  }
  componentDidMount() {
    this.geoman = new GeoMan('http://10.71.71.71', 8080, {
      container: 'map',
      center: [124.842624, 1.4794296],
      zoom: 14,
    }, this.state.active_style);
    this.geoman.setReadyCallback(() => {
      this.geoman.getDistricts().then((districts) => this.setState({ districts }));
      this.geoman.getBasemaps().then((basemaps) => this.setState({ basemaps }));
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
  render() {
    const { districts, subdistricts, neighbors, basemaps } = this.state;
    return (
      <div className="App">
        <div id="map"></div>
        <div className="control region">
          <div className="control-head">
            Wilayah
          </div>
          <ul>
            {districts.map((d, i) => (
              <li key={i}>
                {d.name} [<a href="#" onClick={() => {
                  const { s_d } = this.state;
                  if (s_d === d.id) {
                    this.setState({ s_d: null });
                  } else {
                    this.setState({
                      s_d: d.id,
                    }, () => this.fetchSubdistrict(d));
                  }
                }}>{this.state.s_d === d.id ? 'collapse' : 'expand'}</a>] [<a href="#" onClick={() => d.focus()}>focus</a>]
                  <ul>
                  {this.state.s_d === d.id && subdistricts.map((s, j) => (
                    <li key={j}>
                      {s.name} [<a href="#" onClick={() => {
                        const { s_s } = this.state;
                        if (s_s === s.id) {
                          this.setState({ s_s: null });
                        } else {
                          this.setState({
                            s_s: s.id,
                          }, () => this.fetchNeighbors(s));
                        }
                      }}>{this.state.s_s === s.id ? 'collapse' : 'expand'}</a>] [<a href="#" onClick={() => s.focus()}>focus</a>]
                        <ul>
                        {this.state.s_s === s.id && neighbors.map((n, k) => (
                          <li key={k}>{n.name} [<a href="#" onClick={() => n.focus()}>focus</a>]</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div className="control basemap">
          <div className="control-head">
            Basemap
          </div>
          <ul>
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
        </div>
        <div className="style-options">
          <ul>
            {Object.keys(GeoMan.Styles).map((s, i) => (
              <li className={this.state.active_style === s ? 'active' : ''} key={i} onClick={() => {
                this.setState({ active_style: s });
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
