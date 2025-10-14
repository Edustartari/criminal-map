'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/app/page.module.css';
import '@/app/styles/home.css';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import _ from 'lodash';
import districts_available from '../../assets/districts_available.json';
import SPChart from '@/app/sp_chart.js';
import { crimes_type_list, crimes_subtype_list } from '@/app/crimes_lists.js';

import Box from '@mui/material/Box';
import { LineChart } from '@mui/x-charts/LineChart';

function numberWithDots(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const legend_colors = ['#fff7eb', '#ffd699', '#ffb74d', '#f29044', '#e5693b', '#f44336', '#a82424', '#761919', '#400d0d'];

// Format districts_available.json to a more readable format
let districts = {};
Object.entries(districts_available).map(([key, value]) => {
  if (key == '565') return;
  let district = value.split(' - ')[0];
  let dp = value.split(' - ')[1];
  district = district.replace('DP', '');
  district = district.replace(' ', '');
  districts[key] = dp + ' · ' + parseInt(district) + 'º DP';
});

// Order alphabetically
let districts_list = Object.entries(districts).sort((a, b) => a[1].localeCompare(b[1]));
districts_list.unshift(['565', 'ALL POLICE DISTRICTS']);

// Create list of years since the year 2001 until 2025, and reverse it
let years = _.range(2001, 2026).reverse();

const xLabels = [
  '2016',
  '2017',
  '2018',
  '2019',
  '2020',
  '2021',
  '2022',
  '2023',
  '2024',
  '2025',
];

const Home = () => {
  const [district_selected, setDistrictSelected] = useState('565');
  const [year_selected, setYearSelected] = useState(2023);
  const [districts_list_state, setDistrictsListState] = useState(districts_list);
  const [crime_type, setCrimeType] = useState('All');
  const [crime_subtype, setCrimeSubtype] = useState('All');
  const [violent_ranking, setViolentRanking] = useState([]);
  const [most_violent_ranking_list, setMostViolentRankingList] = useState([]);
  const [less_violent_ranking_list, setLessViolentRankingList] = useState([]);
  const [highest_value, setHighestValue] = useState(0);
  const [district_highlighted, setDistrictHighlighted] = useState(false);
  const [districtChartData, setDistrictChartData] = useState([]);
  const [spChartData, setSpChartData] = useState([]);

  useEffect(() => {
    filter_data();
  }, []);

  useEffect(() => {
    set_color();
  }, [violent_ranking]);

  const format_data = (type = 'All', subtype = 'All', district = '565', year = 2025) => {
    // Fetch data from all districts (only from year selected) inside the folder where the json files are
    let districts_data = {};
    const req = require.context('../../assets/json', true, /\.json$/);
    req.keys().forEach(function (key) {
      let suffix = key.split('_');
      let year_file = suffix[1].replace('.json', '');
      let district_id = suffix[0].split('/')[3];
      if (year_file == year && district_id in districts_available) {
        districts_data[district_id] = req(key);
      }
    });

    // We'll create a list of lists with the district_id and the total of crimes for each one
    let violent_ranking_lst = [];
    // Get all ssp_keys from crimes_list
    let ssp_keys = crimes_subtype_list.map(item => item['ssp_key']);
    Object.entries(districts_data).map(([key, value]) => {
      let total = 0;
      for (let i of value) {
        if (type === 'All') {
          if (ssp_keys.includes(i['Natureza'])) {
            total += i['Total'];
          }
        } else if (type === 'ESTUPRO' || type === 'LATROCÍNIO') {
          let natureza = type === 'ESTUPRO' ? 'TOTAL DE ESTUPRO (4)' : 'LATROCÍNIO';
          if (natureza === i['Natureza']) {
            total += i['Total'];
          }
        } else {
          if (subtype === 'All' && i['Natureza'].includes(type) && ssp_keys.includes(i['Natureza'])) {
            total += i['Total'];
          } else if (i['Natureza'] === subtype) {
            total += i['Total'];
          }
        }
      }
      violent_ranking_lst.push([key, total]);
    });

    violent_ranking_lst.shift();
    let most_violent_original = [...violent_ranking_lst];
    let less_violent_original = [...violent_ranking_lst];
    most_violent_original = most_violent_original.sort((a, b) => b[1] - a[1]);
    less_violent_original = less_violent_original.sort((a, b) => a[1] - b[1]);

    function get_ranked_list(value) {
      let violent = value.slice(0, 5);
      violent = violent.map(item => item[0]);
      if (district != 565) {
        let selected_district = value.filter(item => item[0] == district);
        let already_present = violent.filter(item => item == district);
        if (already_present.length === 0) {
          violent = violent.slice(0, 4);
          violent.push(selected_district[0][0]);
        } else {
          for (let i = violent.length - 1; i >= violent.length; i--) {
            if (violent[i] !== district) {
              violent.pop(i);
              break;
            }
          }
          violent.push(selected_district[0][0]);
        }
      }

      let violent_ranking_dict = {};
      value.map(item => {
        let dp = districts_available[item[0]].split(' - ')[1];
        if (dp && violent.includes(item[0])) {
          violent_ranking_dict[item[0]] = {
            rank: value.indexOf(item) + 1,
            total: item[1],
            district_name: dp
          };
        }
      });
      // Order by rank
      let violent_ranking_list = Object.entries(violent_ranking_dict).sort((a, b) => a[1]['rank'] - b[1]['rank']);

      return violent_ranking_list;
    }

    let most_violent_ranking_list = get_ranked_list(most_violent_original);
    let less_violent_ranking_list = get_ranked_list(less_violent_original);

    // Get the highest value from the violent_ranking
    let highest_value = Math.max.apply(
      Math,
      violent_ranking_lst.map(function (o) {
        return o[1];
      })
    );

    // Check if there is any district selected
    let dp_id = '';
    Object.entries(districts_available).map(([key, value]) => {
      if (key === district) {
        dp_id = value.split(' DP - ')[0];
      }
    });
    let district_highlighted = district != '565' ? dp_id : false;

    return { violent_ranking_lst, most_violent_ranking_list, less_violent_ranking_list, highest_value, district_highlighted };
  }

  const getLineChartData = (type, subtype, district, year) => {
    let total_crimes_district = [];
    let total_crimes_sp = [];
    const last_ten_years = _.range(year - 9, year + 1);
    for (let item of last_ten_years) {
      const { violent_ranking_lst, most_violent_ranking_list, less_violent_ranking_list, highest_value, district_highlighted } = format_data(type, subtype, district, item);
      total_crimes_sp.push(violent_ranking_lst.reduce((a, b) => a + b[1], 0));
      if(district !== '565') {
        total_crimes_district.push(violent_ranking_lst.reduce((a, b) => b[0] === district ? a + b[1] : a, 0));
      }
    }
    setDistrictChartData(total_crimes_district);
    setSpChartData(total_crimes_sp);
  }

  const filter_data = (type = 'All', subtype = 'All', district = '565', year = 2025) => {

    const { violent_ranking_lst, most_violent_ranking_list, less_violent_ranking_list, highest_value, district_highlighted } = format_data(type, subtype, district, year);
    getLineChartData(type, subtype, district, year);

    setDistrictSelected(district);
    setYearSelected(year);
    setCrimeType(type);
    setCrimeSubtype(subtype);
    setViolentRanking(violent_ranking_lst);
    setMostViolentRankingList(most_violent_ranking_list);
    setLessViolentRankingList(less_violent_ranking_list);
    setHighestValue(highest_value);
    setDistrictHighlighted(district_highlighted);

    if (district === '565') {
      setDistrictHighlighted(false);
    }
  }

  const find_color = (district_stat) => {
    let color = 'white';
    if (highest_value < 16) {
      if (district_stat <= 2) color = 'white';
      else if (district_stat <= 4) color = '#ffd699';
      else if (district_stat <= 6) color = '#ffb74d';
      else if (district_stat <= 8) color = '#f29044';
      else if (district_stat <= 10) color = '#e5693b';
      else if (district_stat <= 12) color = '#f44336';
      else if (district_stat <= 15) color = '#a82424';
      else if (district_stat > 15) color = '#761919';
    } else {
      let range = highest_value / 8;
      range = Math.floor(range);
      if (district_stat <= range) color = 'white';
      else if (district_stat <= range * 2) color = '#ffd699';
      else if (district_stat <= range * 3) color = '#ffb74d';
      else if (district_stat <= range * 4) color = '#f29044';
      else if (district_stat <= range * 5) color = '#e5693b';
      else if (district_stat <= range * 6) color = '#f44336';
      else if (district_stat <= range * 7) color = '#a82424';
      else if (district_stat > range * 7) color = '#761919';
    }

    return color;
  }

  const set_color = () => {
    for (let item of violent_ranking) {
      let district = districts_available[item[0]];
      let dp_id = district.split(' DP - ')[0];
      let district_stat = item[1];
      let color = 'white';

      if (district_highlighted && district_selected !== item[0]) {
        color = 'transparent';
      } else {
        color = find_color(district_stat);
      }
      let path = document.getElementById(`path_${dp_id}`);
      path.style.fill = color;
      path.style.stroke = district_highlighted ? '#23698b' : 'black';
    }
  }

  const highlight_district = (dp_id) => {
    let selected_dp_id = '';
    Object.entries(districts_available).map(([key, value]) => {
      let district_id = value.split(' DP - ')[0];
      if (district_id === dp_id) selected_dp_id = key;
    });

    if (district_highlighted === dp_id) {
      filter_data(crime_type, crime_subtype, '565', year_selected);
    } else {
      filter_data(crime_type, crime_subtype, selected_dp_id, year_selected);
    }
  }

  const isHovered = (range_start, range_end) => {
    if (range_end) {
      for (let item of violent_ranking) {
        let district = districts_available[item[0]];
        let dp_id = district.split(' DP - ')[0];

        let district_stat = item[1];
        let color = 'white';
        if (district_stat > range_start && district_stat <= range_end) {
          color = find_color(district_stat);
        } else {
          color = 'transparent';
        }
        let path = document.getElementById(`path_${dp_id}`);
        path.style.fill = color;
        path.style.stroke = '#23698b';
      }
    } else {
      set_color();
    }
  }

  let range = highest_value < 16 ? 2 : highest_value / 8;
  // Abbreaviate range
  range = Math.floor(range);

  const district_selected_name = district_selected in districts_available ? districts_available[district_selected].split('DP - ')[1] : '';

  return (
    <div className='criminal-map-main-background'>
      <div className='criminal-map-main-header'>Criminality Map of São Paulo</div>
      <div className='criminal-map-main-container'>
        <div className='criminal-map-stats'>
          <div className='criminal-map-stats-options'>
            <div className='criminal-map-stats-options-buttons'>
              {crimes_type_list.map((item, index) => {
                return (
                  <div
                    key={index}
                    className='criminal-map-stats-options-button-details'
                    style={crime_type === item['key'] ? { backgroundColor: '#c62828' } : {}}
                    onClick={() =>
                      filter_data(item['key'], 'All', district_selected, year_selected)
                    }
                  >
                    {item['menu_title']}
                  </div>
                );
              })}
            </div>
            <div className='criminal-map-stats-options-button-secondary'>
              {crimes_subtype_list.map((item, index) => {
                if (item['key'] !== crime_type) return;
                else if (item['key'] === 'LATROCÍNIO' || item['key'] === 'ESTUPRO') return;
                return (
                  <div
                    key={index}
                    className='criminal-map-stats-options-button-details'
                    style={crime_subtype === item['ssp_key'] ? { backgroundColor: '#c62828' } : {}}
                    onClick={() =>
                      filter_data(
                        item['key'],
                        item['ssp_key'],
                        district_selected,
                        year_selected
                      )
                    }
                  >
                    {item['menu_title']}
                  </div>
                );
              })}
            </div>
          </div>
          <div className='criminal-map-stats-select'>
            <div className='criminal-map-stats-select-neighborhood'>
              <FormControl fullWidth className='criminal-map-stats-select-form'>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  value={district_selected}
                  onChange={e =>
                    filter_data(
                      crime_type,
                      crime_subtype,
                      e.target.value,
                      year_selected
                    )
                  }
                >
                  {districts_list_state.map(item => {
                    return (
                      <MenuItem key={item[0]} value={item[0]}>
                        {item[1]}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
            <div className='criminal-map-stats-select-year'>
              <FormControl fullWidth className='criminal-map-stats-select-form'>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  value={year_selected}
                  onChange={e =>
                    filter_data(
                      crime_type,
                      crime_subtype,
                      district_selected,
                      e.target.value
                    )
                  }
                >
                  {years.map(year => {
                    return (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
          </div>
          <div className='criminal-map-stats-ranking'>
            <div className='criminal-map-stats-ranking-card'>
              <div className='criminal-map-stats-ranking-card-title'>MOST VIOLENT</div>
              <div className='criminal-map-stats-ranking-card-list'>
                {most_violent_ranking_list.slice(0, 5).map((item, index) => {
                  let select_district = district_selected === item[0] ? '565' : item[0];
                  return (
                    <div
                      key={item[0]}
                      className='criminal-map-stats-ranking-card-list-item'
                      style={district_selected === item[0] ? { color: 'gold' } : {}}
                    >
                      <div
                        className='criminal-map-stats-ranking-card-list-item-title'
                        onClick={() =>
                          filter_data(
                            crime_type,
                            crime_subtype,
                            select_district,
                            year_selected
                          )
                        }
                      >
                        {item[1]['rank'] + 'º ' + item[1]['district_name']}
                      </div>
                      <div className='criminal-map-stats-ranking-card-list-item-number'>
                        {numberWithDots(item[1]['total'])}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className='criminal-map-stats-ranking-card'>
              <div className='criminal-map-stats-ranking-card-title'>LESS VIOLENT</div>
              <div className='criminal-map-stats-ranking-card-list'>
                {less_violent_ranking_list.slice(0, 5).map((item, index) => {
                  let select_district = district_selected === item[0] ? '565' : item[0];
                  return (
                    <div
                      key={item[0]}
                      className='criminal-map-stats-ranking-card-list-item'
                      style={district_selected === item[0] ? { color: 'gold' } : {}}
                    >
                      <div
                        className='criminal-map-stats-ranking-card-list-item-title'
                        onClick={() =>
                          filter_data(
                            crime_type,
                            crime_subtype,
                            select_district,
                            year_selected
                          )
                        }
                      >
                        {item[1]['rank'] + 'º ' + item[1]['district_name']}
                      </div>
                      <div className='criminal-map-stats-ranking-card-list-item-number'>
                        {numberWithDots(item[1]['total'])}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className='criminal-map-stats-months'>
            <Box sx={{ width: '100%', height: 300 }}>
              <LineChart
                series={[                  
                  { data: districtChartData.length > 0 ? districtChartData : spChartData, label: districtChartData.length > 0 ? district_selected_name : 'São Paulo' },
                ]}
                xAxis={[{ scaleType: 'point', data: xLabels, label: 'Year', labelProps: { fill: 'white' }, tickLabelProps: { fill: 'white' } }]}
                yAxis={[{ width: 50 }]}
                margin={{ right: 24 }}
              />
            </Box>
          </div>
          <div className='criminal-map-stats-footer'>Source: Secretaria de Estado da Segurança Pública de São Paulo</div>
        </div>
        <div className='criminal-map-chart'>
          <SPChart set_color={set_color} highlight_district={highlight_district} />
          <div className='criminal-map-chart-legend'>
            <div
              className='criminal-map-chart-legend-item'
              onMouseEnter={() => isHovered(0, range)}
              onMouseLeave={() => isHovered(false, false)}
            >
              <div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: 'white' }}></div>
              <div className='criminal-map-chart-legend-item-range'>0 a {range}</div>
            </div>
            <div
              className='criminal-map-chart-legend-item'
              onMouseEnter={() => isHovered(range + 1, range * 2)}
              onMouseLeave={() => isHovered(false, false)}
            >
              <div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#ffd699' }}></div>
              <div className='criminal-map-chart-legend-item-range'>
                {range + 1} a {range * 2}
              </div>
            </div>
            <div
              className='criminal-map-chart-legend-item'
              onMouseEnter={() => isHovered(range * 2 + 1, range * 3)}
              onMouseLeave={() => isHovered(false, false)}
            >
              <div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#ffb74d' }}></div>
              <div className='criminal-map-chart-legend-item-range'>
                {range * 2 + 1} a {range * 3}
              </div>
            </div>
            <div
              className='criminal-map-chart-legend-item'
              onMouseEnter={() => isHovered(range * 3 + 1, range * 4)}
              onMouseLeave={() => isHovered(false, false)}
            >
              <div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#f29044' }}></div>
              <div className='criminal-map-chart-legend-item-range'>
                {range * 3 + 1} a {range * 4}
              </div>
            </div>
            <div
              className='criminal-map-chart-legend-item'
              onMouseEnter={() => isHovered(range * 4 + 1, range * 5)}
              onMouseLeave={() => isHovered(false, false)}
            >
              <div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#e5693b' }}></div>
              <div className='criminal-map-chart-legend-item-range'>
                {range * 4 + 1} a {range * 5}
              </div>
            </div>
            <div
              className='criminal-map-chart-legend-item'
              onMouseEnter={() => isHovered(range * 5 + 1, range * 6)}
              onMouseLeave={() => isHovered(false, false)}
            >
              <div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#f44336' }}></div>
              <div className='criminal-map-chart-legend-item-range'>
                {range * 5 + 1} a {range * 6}
              </div>
            </div>
            <div
              className='criminal-map-chart-legend-item'
              onMouseEnter={() => isHovered(range * 6 + 1, range * 7)}
              onMouseLeave={() => isHovered(false, false)}
            >
              <div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#a82424' }}></div>
              <div className='criminal-map-chart-legend-item-range'>
                {range * 6 + 1} a {range * 7}
              </div>
            </div>
            <div
              className='criminal-map-chart-legend-item'
              onMouseEnter={() => isHovered(range * 7 + 1, 50000000000)}
              onMouseLeave={() => isHovered(false, false)}
            >
              <div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#761919' }}></div>
              <div className='criminal-map-chart-legend-item-range'>
                {'>'} {range * 7 + 1}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
