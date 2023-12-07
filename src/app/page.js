'use client'
import React from 'react'
import ReactDOM from 'react-dom'
import Image from 'next/image'
import styles from '@/app/page.module.css';
import '@/app/styles/home.css'
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import sp_map from '../../public/sp_map.svg';
import _ from "lodash";
import districts_available from '../../assets/districts_available.json';
import SPChart from '@/app/sp_chart.js';
import {crimes_type_list, crimes_subtype_list } from '@/app/crimes_lists.js'

function numberWithDots(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

console.log('districts_available: ', districts_available);

// Format districts_available.json to a more readable format
let districts = {}
Object.entries(districts_available).map(([key, value]) => {
	if (key == '565') return;
	let district = value.split(' - ')[0];
	let dp = value.split(' - ')[1];
	district = district.replace('DP', '');
	district = district.replace(' ', '');
	districts[key] = dp + ' · ' + parseInt(district) + 'º DP';
})
console.log('districts: ', districts);

// Order alphabetically
let districts_list = Object.entries(districts).sort((a, b) =>  a[1].localeCompare(b[1]) );
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
			less_violent_ranking_list: []
		}
		this.filter_data = this.filter_data.bind(this);

	}
	
	componentDidMount() {
		this.filter_data();
	}

	filter_data(type = 'All', subtype = 'All', district = '565', year = 2023){
		console.log('')
		console.log('filter_data')
		console.log('type: ', type)
		console.log('district: ', district)
		console.log('year: ', year)

		let districts_data = {}
		const req = require.context('../../assets/json', true, /\.json$/)
		req.keys().forEach(function(key){
			let suffix = key.split('_');
			let year_file = suffix[1].replace('.json', '');
			let district_id = suffix[0].split('/')[3];
			if (year_file == year && district_id in districts_available) {
				districts_data[district_id] = req(key);
			}
		});
		console.log('districts_data: ', districts_data);
		
		let violent_ranking = []
		// Get all ssp_keys from crimes_list
		let ssp_keys = crimes_subtype_list.map((item) => item['ssp_key']);
		if (type === 'All'){
			Object.entries(districts_data).map(([key, value]) => {
				let total = 0;
				for(let i of value) {
					if (ssp_keys.includes(i['Natureza'])){
						total += i['Total'];
					}
				}
				violent_ranking.push([key, total]);
			})
		}

		console.log('violent_ranking: ', violent_ranking);
		
		let most_violent_original = [...violent_ranking];
		let less_violent_original = [...violent_ranking];
		most_violent_original.shift();
		most_violent_original = most_violent_original.sort((a, b) => b[1] - a[1]);
		less_violent_original = less_violent_original.sort((a, b) => a[1] - b[1]);
		
		let most_violent = most_violent_original.slice(0,5);
		most_violent = most_violent.map((item) => item[0]);
		if (district != 565){
			let selected_district = most_violent_original.filter((item) => item[0] == district);
			let already_present = most_violent.filter((item) => item == district);
			if (already_present.length === 0){
				most_violent = most_violent.slice(0,4);
				most_violent.push(selected_district[0][0]);
			} else {
				for(let i=most_violent.length - 1; i>=most_violent.length; i--){
					if (most_violent[i] !== district){
						most_violent.pop(i);
						break
					}
				}
				most_violent.push(selected_district[0][0]);
			}
			console.log('most_violent: ', most_violent);
			
		}
		console.log('most_violent_original: ', most_violent_original);

		// Create a dict from violent_ranking
		let most_violent_ranking = {}
		most_violent_original.map((item) => {
			let dp = districts_available[item[0]].split(' - ')[1];
			if (dp && most_violent.includes(item[0])){
				most_violent_ranking[item[0]] = {
					'rank': most_violent_original.indexOf(item) + 1,
					'total': item[1],
					'district_name': dp
				};
			}
		})
		// Order by rank
		let most_violent_ranking_list = Object.entries(most_violent_ranking).sort((a, b) => a[1]['rank'] - b[1]['rank']);
		
		let less_violent = less_violent_original.slice(0,5);
		less_violent = less_violent.map((item) => item[0]);
		if (district != 565){
			let selected_district = less_violent_original.filter((item) => item[0] == district);
			let already_present = less_violent.filter((item) => item == district);
			if (already_present.length === 0){
				less_violent = less_violent.slice(0,4);
				less_violent.push(selected_district[0][0]);
			} else {
				for(let i=less_violent.length - 1; i>=less_violent.length; i--){
					if (less_violent[i] !== district){
						less_violent.pop(i);
						break
					}
				}
				less_violent.push(selected_district[0][0]);
			}
			console.log('less_violent: ', less_violent);
			
		}
		console.log('less_violent_original: ', less_violent_original);
		// Create a dict from violent_ranking
		let less_violent_ranking = {}
		less_violent_original.map((item) => {
			let dp = districts_available[item[0]].split(' - ')[1];
			if (dp && less_violent.includes(item[0])){
				less_violent_ranking[item[0]] = {
					'rank': less_violent_original.indexOf(item) + 1,
					'total': item[1],
					'district_name': dp
				};
			}
		})
		// Order by rank
		let less_violent_ranking_list = Object.entries(less_violent_ranking).sort((a, b) => a[1]['rank'] - b[1]['rank']);
		console.log('less_violent_ranking_list: ', less_violent_ranking_list);

		this.setState({
			violent_ranking: violent_ranking,
			most_violent_ranking_list: most_violent_ranking_list,
			less_violent_ranking_list: less_violent_ranking_list,
			crime_type: type,
			crime_subtype: subtype,
			district_selected: district,
			year_selected: year		
		})
	}

	render() {
		// console.log('')
		// console.log('most_violent_ranking_list: ', this.state.most_violent_ranking_list)
		// console.log('less_violent_ranking_list: ', this.state.less_violent_ranking_list)
		return (
			<div className='criminal-map-main-background'>
				<div className='criminal-map-main-header'>
					Criminality Map of São Paulo
				</div>
				<div className='criminal-map-main-container'>
					<div className='criminal-map-stats'>
						<div className='criminal-map-stats-options'>
							<div className='criminal-map-stats-options-buttons'>
								{crimes_type_list.map((item, index) => {
									return(
										<div
											key={index}
											className='criminal-map-stats-options-button-details' 
											style={this.state.crime_type === item['key'] ? {backgroundColor: '#c62828'} : {}} 
											onClick={() => this.filter_data(item['key'], this.state.crime_subtype, this.state.district_selected, this.state.year_selected)}
										>
												{item['menu_title']}
										</div>
									)
								})}
							</div>
							<div className='criminal-map-stats-options-button-secondary'>
								{crimes_subtype_list.map((item, index) => {
									if(item['key'] !== this.state.crime_type) return;
									else if (item['key'] === 'LATROCÍNIO' || item['key'] === 'ESTUPRO') return;
									return(
										<div
											key={index}
											className='criminal-map-stats-options-button-details' 
											style={this.state.crime_subtype === item['ssp_key'] ? {backgroundColor: '#c62828'} : {}} 
											onClick={() => this.filter_data(item['key'], item['ssp_key'], this.state.district_selected, this.state.year_selected)}
										>
												{item['menu_title']}
										</div>
									)
								})}
							</div>
						</div>
						<div className='criminal-map-stats-select'>
							<div className='criminal-map-stats-select-neighborhood'>
								<FormControl fullWidth className='criminal-map-stats-select-form'>
									<Select
										labelId="demo-simple-select-label"
										id="demo-simple-select"
										value={this.state.district_selected}
										onChange={(e) => this.filter_data(this.state.crime_type, this.state.crime_subtype, e.target.value, this.state.year_selected)}
									>
										{this.state.districts_list.map((item) => {
											return(
												<MenuItem key={item[0]} value={item[0]}>{item[1]}</MenuItem>
											)
										})}
									</Select>
								</FormControl>
							</div>
							<div className='criminal-map-stats-select-year'>
								<FormControl fullWidth className='criminal-map-stats-select-form'>
									<Select
										labelId="demo-simple-select-label"
										id="demo-simple-select"
										value={this.state.year_selected}
										onChange={(e) => this.filter_data(this.state.crime_type, this.state.crime_subtype, this.state.district_selected, e.target.value)}
									>
										{years.map((year) => {
											return(
												<MenuItem key={year} value={year}>{year}</MenuItem>
											)
										})}
									</Select>
								</FormControl>
							</div>
						</div>
						<div className='criminal-map-stats-ranking'>
							<div className='criminal-map-stats-ranking-card'>
								<div className='criminal-map-stats-ranking-card-title'>MOST VIOLENT</div>
								<div className='criminal-map-stats-ranking-card-list'>
									{this.state.most_violent_ranking_list.slice(0,5).map((item, index) => {
										let select_district = this.state.district_selected === item[0] ? '565' : item[0];
										return(
											<div key={item[0]} className='criminal-map-stats-ranking-card-list-item' style={this.state.district_selected === item[0] ? {color: 'gold'} : {}}>
												<div 
													className='criminal-map-stats-ranking-card-list-item-title' 
													onClick={() => this.filter_data(this.state.crime_type, this.state.crime_subtype, select_district, this.state.year_selected)}>{item[1]['rank'] + 'º ' + item[1]['district_name']}
												</div>
												<div className='criminal-map-stats-ranking-card-list-item-number'>{numberWithDots(item[1]['total'])}</div>
											</div>
										)
									})}
								</div>
							</div>
							<div className='criminal-map-stats-ranking-card'>
								<div className='criminal-map-stats-ranking-card-title'>LESS VIOLENT</div>
								<div className='criminal-map-stats-ranking-card-list'>
									{this.state.less_violent_ranking_list.slice(0,5).map((item, index) => {
										let select_district = this.state.district_selected === item[0] ? '565' : item[0];
										return(
											<div key={item[0]} className='criminal-map-stats-ranking-card-list-item' style={this.state.district_selected === item[0] ? {color: 'gold'} : {}}>
												<div 
													className='criminal-map-stats-ranking-card-list-item-title'
													onClick={() => this.filter_data(this.state.crime_type, this.state.crime_subtype, select_district, this.state.year_selected)}>{item[1]['rank'] + 'º ' + item[1]['district_name']}
												</div>
												<div className='criminal-map-stats-ranking-card-list-item-number'>{numberWithDots(item[1]['total'])}</div>
											</div>
										)
									})}
								</div>
							</div>
						</div>
						<div className='criminal-map-stats-months'></div>
						<div className='criminal-map-stats-footer'>Source: Secretaria de Estado da Segurança Pública de São Paulo</div>
					</div>
					<div className='criminal-map-chart'>
						<SPChart />
						<div className='criminal-map-chart-legend'>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square'></div>
								<div className='criminal-map-chart-legend-item-range'>0 a 720</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square'></div>
								<div className='criminal-map-chart-legend-item-range'>720 a 1296</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square'></div>
								<div className='criminal-map-chart-legend-item-range'>720 a 1296</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square'></div>
								<div className='criminal-map-chart-legend-item-range'>720 a 1296</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square'></div>
								<div className='criminal-map-chart-legend-item-range'>720 a 1296</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square'></div>
								<div className='criminal-map-chart-legend-item-range'>720 a 1296</div>
							</div>
							<div className='criminal-map-chart-legend-item'>
								<div className='criminal-map-chart-legend-item-square'></div>
								<div className='criminal-map-chart-legend-item-range'>720 a 1296</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default Home;