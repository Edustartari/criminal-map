'use client';
import React from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import styles from '@/app/page.module.css';
import '@/app/styles/home.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import sp_map from '../../public/sp_map.svg';
import _ from 'lodash';
import districts_available from '../../assets/districts_available.json';
import SPChart from '@/app/sp_chart.js';
import { crimes_type_list, crimes_subtype_list } from '@/app/crimes_lists.js';

function numberWithDots(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const legend_colors = ['#fff7eb', '#ffd699', '#ffb74d', '#f29044', '#e5693b', '#f44336', '#a82424', '#761919', '#400d0d'];

console.log('districts_available: ', districts_available);

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
console.log('districts: ', districts);

// Order alphabetically
let districts_list = Object.entries(districts).sort((a, b) => a[1].localeCompare(b[1]));
districts_list.unshift(['565', 'ALL POLICE DISTRICTS']);

// Create list of years since the year 2001 until 2023, and reverse it
let years = _.range(2001, 2024).reverse();

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			district_selected: '565',
			year_selected: 2023,
			districts_list: districts_list,
			crime_type: 'All',
			crime_subtype: 'All',
			violent_ranking: [],
			most_violent_ranking_list: [],
			less_violent_ranking_list: [],
			highest_value: 0,
			district_highlighted: false
		};
		this.filter_data = this.filter_data.bind(this);
		this.set_color = this.set_color.bind(this);
		this.find_color = this.find_color.bind(this);
		this.highlight_district = this.highlight_district.bind(this);
	}

	componentDidMount() {
		this.filter_data();
	}

	filter_data(type = 'All', subtype = 'All', district = '565', year = 2023) {
		console.log('');
		console.log('filter_data');
		console.log('type: ', type);
		console.log('subtype: ', subtype);
		console.log('district: ', district);
		console.log('year: ', year);

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
		console.log('districts_data: ', districts_data);

		let violent_ranking = [];
		// Get all ssp_keys from crimes_list
		let ssp_keys = crimes_subtype_list.map(item => item['ssp_key']);
		console.log('ssp_keys: ', ssp_keys);
		if (type === 'All') {
			Object.entries(districts_data).map(([key, value]) => {
				let total = 0;
				for (let i of value) {
					if (ssp_keys.includes(i['Natureza'])) {
						total += i['Total'];
					}
				}
				violent_ranking.push([key, total]);
			});
		} else if (type === 'ESTUPRO' || type === 'LATROCÍNIO') {
			let natureza = type === 'ESTUPRO' ? 'TOTAL DE ESTUPRO (4)' : 'LATROCÍNIO';
			Object.entries(districts_data).map(([key, value]) => {
				let total = 0;
				for (let i of value) {
					if (natureza === i['Natureza']) {
						total += i['Total'];
					}
				}
				violent_ranking.push([key, total]);
			});
		} else {
			Object.entries(districts_data).map(([key, value]) => {
				let total = 0;
				for (let i of value) {
					if (subtype === 'All' && i['Natureza'].includes(type) && ssp_keys.includes(i['Natureza'])) {
						total += i['Total'];
					} else if (i['Natureza'] === subtype) {
						total += i['Total'];
					}
				}
				violent_ranking.push([key, total]);
			});
		}

		console.log('violent_ranking: ', violent_ranking);

		violent_ranking.shift();
		let most_violent_original = [...violent_ranking];
		let less_violent_original = [...violent_ranking];
		most_violent_original = most_violent_original.sort((a, b) => b[1] - a[1]);
		less_violent_original = less_violent_original.sort((a, b) => a[1] - b[1]);

		let most_violent = most_violent_original.slice(0, 5);
		most_violent = most_violent.map(item => item[0]);
		if (district != 565) {
			let selected_district = most_violent_original.filter(item => item[0] == district);
			let already_present = most_violent.filter(item => item == district);
			if (already_present.length === 0) {
				most_violent = most_violent.slice(0, 4);
				most_violent.push(selected_district[0][0]);
			} else {
				for (let i = most_violent.length - 1; i >= most_violent.length; i--) {
					if (most_violent[i] !== district) {
						most_violent.pop(i);
						break;
					}
				}
				most_violent.push(selected_district[0][0]);
			}
			console.log('most_violent: ', most_violent);
		}
		console.log('most_violent_original: ', most_violent_original);

		let most_violent_ranking = {};
		most_violent_original.map(item => {
			let dp = districts_available[item[0]].split(' - ')[1];
			if (dp && most_violent.includes(item[0])) {
				most_violent_ranking[item[0]] = {
					rank: most_violent_original.indexOf(item) + 1,
					total: item[1],
					district_name: dp
				};
			}
		});
		// Order by rank
		let most_violent_ranking_list = Object.entries(most_violent_ranking).sort((a, b) => a[1]['rank'] - b[1]['rank']);

		let less_violent = less_violent_original.slice(0, 5);
		less_violent = less_violent.map(item => item[0]);
		if (district != 565) {
			let selected_district = less_violent_original.filter(item => item[0] == district);
			let already_present = less_violent.filter(item => item == district);
			if (already_present.length === 0) {
				less_violent = less_violent.slice(0, 4);
				less_violent.push(selected_district[0][0]);
			} else {
				for (let i = less_violent.length - 1; i >= less_violent.length; i--) {
					if (less_violent[i] !== district) {
						less_violent.pop(i);
						break;
					}
				}
				less_violent.push(selected_district[0][0]);
			}
			console.log('less_violent: ', less_violent);
		}
		console.log('less_violent_original: ', less_violent_original);
		let less_violent_ranking = {};
		less_violent_original.map(item => {
			let dp = districts_available[item[0]].split(' - ')[1];
			if (dp && less_violent.includes(item[0])) {
				less_violent_ranking[item[0]] = {
					rank: less_violent_original.indexOf(item) + 1,
					total: item[1],
					district_name: dp
				};
			}
		});
		// Order by rank
		let less_violent_ranking_list = Object.entries(less_violent_ranking).sort((a, b) => a[1]['rank'] - b[1]['rank']);
		console.log('less_violent_ranking_list: ', less_violent_ranking_list);

		// Get the highest value from the violent_ranking
		let highest_value = Math.max.apply(
			Math,
			violent_ranking.map(function (o) {
				return o[1];
			})
		);
		console.log('highest_value: ', highest_value);

		this.state.violent_ranking = violent_ranking;
		this.state.most_violent_ranking_list = most_violent_ranking_list;
		this.state.less_violent_ranking_list = less_violent_ranking_list;
		this.state.crime_type = type;
		this.state.crime_subtype = subtype;
		this.state.district_selected = district;
		this.state.year_selected = year;
		this.state.highest_value = highest_value;

		this.setState({
			violent_ranking: violent_ranking,
			most_violent_ranking_list: most_violent_ranking_list,
			less_violent_ranking_list: less_violent_ranking_list,
			crime_type: type,
			crime_subtype: subtype,
			district_selected: district,
			year_selected: year,
			highest_value: highest_value
		});

		this.set_color()
	}

	find_color(district_stat) {
		let color = 'white';
		if (this.state.highest_value < 16) {
			if (district_stat <= 2) color = 'white';
			else if (district_stat <= 4) color = '#ffd699';
			else if (district_stat <= 6) color = '#ffb74d';
			else if (district_stat <= 8) color = '#f29044';
			else if (district_stat <= 10) color = '#e5693b';
			else if (district_stat <= 12) color = '#f44336';
			else if (district_stat <= 15) color = '#a82424';
			else if (district_stat > 15) color = '#761919';
		} else {
			let range = this.state.highest_value / 8;
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

	set_color() {
		console.log('')
		console.log('set_color')
		// console.log(path_id)
		// let dp_id = path_id.split('_')[1]
		// let dp_id = path_id
		// console.log(dp_id)

		for(let item of this.state.violent_ranking) {
			console.log('')
			console.log('-----------------------------')
			console.log('item: ', item)
			let district = districts_available[item[0]];
			let dp_id = district.split(' DP - ')[0];
			console.log('district: ', district)
			console.log('dp_id: ', dp_id)
			
			let district_stat = item[1];
			console.log('district_stat: ', district_stat)
			// console.log('district_stat: ', district_stat)
			// Create range for 8 levels based on this.props.highest_value
			let color = this.find_color(district_stat);
			let path = document.getElementById(`path_${dp_id}`);
			console.log('color: ', color)
			path.style.fill = color;
		}
	}

	highlight_district(dp_id) {
		console.log('');
		console.log('highlight_district');
		console.log('dp_id: ', dp_id);
		console.log('this.state.district_highlighted: ', this.state.district_highlighted);

		let district_dict = {};
		Object.entries(districts_available).map(([key, value]) => {
			if (key == '565') return;
			let district = value.split(' DP - ')[0];
			district_dict[district] = key;
		});
		if (dp_id === this.state.district_highlighted) {
			this.setState({ district_highlighted: false });

			this.set_color();
			return;
		}
		let new_highlighted = dp_id;
		this.setState({ district_highlighted: new_highlighted });
		console.log('new_highlighted: ', new_highlighted);

		Object.entries(district_dict).map(([key, value]) => {
			let path = document.getElementById(`path_${key}`);
			path.style.stroke = '#23698b';
			if (key === new_highlighted) {
				let district_stat = this.state.violent_ranking.filter(item => item[0] == value)[0][1];
				let color = this.find_color(district_stat);
				path.style.fill = color;
			} else if (key !== dp_id) {
				path.style.fill = 'transparent';
			}
		});
	}

	render() {
		// console.log('')
		// console.log('most_violent_ranking_list: ', this.state.most_violent_ranking_list)
		// console.log('less_violent_ranking_list: ', this.state.less_violent_ranking_list)
		let range = this.state.highest_value < 16 ? 2 : this.state.highest_value / 8;
		// Abbreaviate range
		range = Math.floor(range);
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
											style={this.state.crime_type === item['key'] ? { backgroundColor: '#c62828' } : {}}
											onClick={() =>
												this.filter_data(item['key'], 'All', this.state.district_selected, this.state.year_selected)
											}
										>
											{item['menu_title']}
										</div>
									);
								})}
							</div>
							<div className='criminal-map-stats-options-button-secondary'>
								{crimes_subtype_list.map((item, index) => {
									if (item['key'] !== this.state.crime_type) return;
									else if (item['key'] === 'LATROCÍNIO' || item['key'] === 'ESTUPRO') return;
									return (
										<div
											key={index}
											className='criminal-map-stats-options-button-details'
											style={this.state.crime_subtype === item['ssp_key'] ? { backgroundColor: '#c62828' } : {}}
											onClick={() =>
												this.filter_data(
													item['key'],
													item['ssp_key'],
													this.state.district_selected,
													this.state.year_selected
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
										value={this.state.district_selected}
										onChange={e =>
											this.filter_data(
												this.state.crime_type,
												this.state.crime_subtype,
												e.target.value,
												this.state.year_selected
											)
										}
									>
										{this.state.districts_list.map(item => {
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
										value={this.state.year_selected}
										onChange={e =>
											this.filter_data(
												this.state.crime_type,
												this.state.crime_subtype,
												this.state.district_selected,
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
									{this.state.most_violent_ranking_list.slice(0, 5).map((item, index) => {
										let select_district = this.state.district_selected === item[0] ? '565' : item[0];
										return (
											<div
												key={item[0]}
												className='criminal-map-stats-ranking-card-list-item'
												style={this.state.district_selected === item[0] ? { color: 'gold' } : {}}
											>
												<div
													className='criminal-map-stats-ranking-card-list-item-title'
													onClick={() =>
														this.filter_data(
															this.state.crime_type,
															this.state.crime_subtype,
															select_district,
															this.state.year_selected
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
									{this.state.less_violent_ranking_list.slice(0, 5).map((item, index) => {
										let select_district = this.state.district_selected === item[0] ? '565' : item[0];
										return (
											<div
												key={item[0]}
												className='criminal-map-stats-ranking-card-list-item'
												style={this.state.district_selected === item[0] ? { color: 'gold' } : {}}
											>
												<div
													className='criminal-map-stats-ranking-card-list-item-title'
													onClick={() =>
														this.filter_data(
															this.state.crime_type,
															this.state.crime_subtype,
															select_district,
															this.state.year_selected
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
						<div className='criminal-map-stats-months'></div>
						<div className='criminal-map-stats-footer'>Source: Secretaria de Estado da Segurança Pública de São Paulo</div>
					</div>
					<div className='criminal-map-chart'>
						<SPChart {...this.state} set_color={this.set_color} highlight_district={this.highlight_district} />
						<div className='criminal-map-chart-legend'>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: 'white' }}></div>
								<div className='criminal-map-chart-legend-item-range'>0 a {range}</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#ffd699' }}></div>
								<div className='criminal-map-chart-legend-item-range'>
									{range + 1} a {range * 2}
								</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#ffb74d' }}></div>
								<div className='criminal-map-chart-legend-item-range'>
									{range * 2 + 1} a {range * 3}
								</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#f29044' }}></div>
								<div className='criminal-map-chart-legend-item-range'>
									{range * 3 + 1} a {range * 4}
								</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#e5693b' }}></div>
								<div className='criminal-map-chart-legend-item-range'>
									{range * 4 + 1} a {range * 5}
								</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#f44336' }}></div>
								<div className='criminal-map-chart-legend-item-range'>
									{range * 5 + 1} a {range * 6}
								</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square' style={{ backgroundColor: '#a82424' }}></div>
								<div className='criminal-map-chart-legend-item-range'>
									{range * 6 + 1} a {range * 7}
								</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
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
}

export default Home;
