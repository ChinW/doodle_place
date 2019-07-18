import React from 'react';
import {Link} from 'react-router-dom';
import planetaryjs from 'planetary.js';

import worldData from './world-110m.json';
import './hero.scss';

function autorotate(degPerSec) {
  // Planetary.js plugins are functions that take a `planet` instance
  // as an argument...
  return function(planet) {
    var lastTick = null;
    var paused = false;
    planet.plugins.autorotate = {
      pause: function() {
        paused = true;
      },
      resume: function() {
        paused = false;
      },
    };
    // ...and configure hooks into certain pieces of its lifecycle.
    planet.onDraw(function() {
      if (paused || !lastTick) {
        lastTick = new Date();
      } else {
        var now = new Date();
        var delta = now - lastTick;
        // This plugin uses the built-in projection (provided by D3)
        // to rotate the globe each time we draw it.
        var rotation = planet.projection.rotate();
        rotation[0] += (degPerSec * delta) / 2000;
        if (rotation[0] >= 180) rotation[0] -= 360;
        planet.projection.rotate(rotation);
        lastTick = now;
      }
    });
  };
}

function lakes(options) {
  options = options || {};
  var lakes = null;

  return function(planet) {
    planet.onInit(function() {
      // We can access the data loaded from the TopoJSON plugin
      // on its namespace on `planet.plugins`. We're loading a custom
      // TopoJSON file with an object called "ne_110m_lakes".
      var world = planet.plugins.topojson.world;
      lakes = topojson.feature(world, world.objects.ne_110m_lakes);
    });

    planet.onDraw(function() {
      planet.withSavedContext(function(context) {
        context.beginPath();
        planet.path.context(context)(lakes);
        context.fillStyle = options.fill || 'black';
        context.fill();
      });
    });
  };
}

export class Hero extends React.Component {
  componentDidMount() {
    console.log(planetaryjs, worldData);
    var planet = planetaryjs.planet();
    // You can remove this statement if `world-110m.json`
    // is in the same path as the HTML page:
    planet.loadPlugin(autorotate(10));
    planet.loadPlugin(
      planetaryjs.plugins.earth({
        topojson: {
          world: worldData,
        },

        oceans: {fill: '#365db1'},
        land: {fill: '#427dfc'},
        borders: {stroke: '#0457B7'},
      })
    );
    // planet.loadPlugin(
    //   planetaryjs.plugins.zoom({
    //     scaleExtent: [200, 300],
    //   })
    // );
    // planet.loadPlugin(
    //   lakes({
    //     fill: '#000080',
    //   })
    // );
    // Make the planet fit well in its canvas
    planet.projection
      .scale(500)
      .translate([window.innerWidth / 4, window.innerHeight / 1.5]);
    var canvas = document.getElementById('globe');
    canvas.width = 800;
    canvas.height = 800;
    planet.draw(canvas);
  }

  render() {
    return (
      <section className="land">
        <section className="hero">
          <div className="title">
            <span>
              <label htmlFor="">E</label>
              <label htmlFor="">A</label>
              <label htmlFor="">G</label>
              <label htmlFor="">L</label>
              <label htmlFor="">E</label>
            </span>
            <span>
              {' '}
              <label htmlFor="">E</label>
              <label htmlFor="">Y</label>
              <label htmlFor="">E</label>
            </span>
          </div>
          <div id="rectangles">
            <ul>
              <li />
              <li />
              <li />
              <li />
              <li />
              <li />
              <li />
              <li />
              <li />
            </ul>
          </div>
          <canvas id="globe" width="1000" height="1000" />
        </section>
      </section>
    );
  }
}
