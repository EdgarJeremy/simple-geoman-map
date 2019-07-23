import React from 'react';
import GeoMan from 'geoman-client';

class App extends React.Component {
  state = {
    districts: [],
    subdistricts: [],
    neighbors: [],
    s_d: null,
    s_s: null
  }
  componentDidMount() {
    this.geoman = new GeoMan('http://36.67.90.80', 8080, {
      container: 'map',
      center: [124.842624, 1.4794296],
      zoom: 14,
    }, GeoMan.Styles.LIGHT);
    this.geoman.getDistricts().then((districts) => this.setState({ districts }));
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
    const { districts, subdistricts, neighbors } = this.state;
    return (
      <div className="App">
        <div id="map"></div>
        <div className="control">
          <div className="control-d">
            <ul>
              {districts.map((d, i) => (
                <li key={i}>
                  <span onClick={() => d.focus()}>{d.name}</span> [<a href="#" onClick={() => {
                    const { s_d } = this.state;
                    if (s_d === d.id) {
                      this.setState({ s_d: null });
                    } else {
                      this.setState({
                        s_d: d.id,
                      }, () => this.fetchSubdistrict(d));
                    }
                  }}><i className={`fa fa-angle-${this.state.s_d === d.id ? 'up' : 'down'}`}></i></a>]
                  <ul>
                    {this.state.s_d === d.id && subdistricts.map((s, j) => (
                      <li key={j}>
                        <span onClick={() => s.focus()}>{s.name}</span> [<a href="#" onClick={() => {
                          const { s_s } = this.state;
                          if (s_s === s.id) {
                            this.setState({ s_s: null });
                          } else {
                            this.setState({
                              s_s: s.id,
                            }, () => this.fetchNeighbors(s));
                          }
                        }}><i className={`fa fa-angle-${this.state.s_s === s.id ? 'up' : 'down'}`}></i></a>]
                        <ul>
                          {this.state.s_s === s.id && neighbors.map((n, k) => (
                            <li key={k}><span onClick={() => n.focus()}>{n.name}</span></li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
