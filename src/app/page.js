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

function numberWithDots(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const crimes_list = [
	'HOMICÍDIO DOLOSO (2)',
	'HOMICÍDIO CULPOSO POR ACIDENTE DE TRÂNSITO',
	'TENTATIVA DE HOMICÍDIO',
	'LESÃO CORPORAL SEGUIDA DE MORTE',
	'LESÃO CORPORAL DOLOSA',
	'LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO',
	'LESÃO CORPORAL CULPOSA - OUTRAS',
	'LATROCÍNIO',
	'TOTAL DE ESTUPRO (4)',
	'TOTAL DE ROUBO - OUTROS (1)',
	'ROUBO DE VEÍCULO',
	'FURTO - OUTROS',
	'FURTO DE VEÍCULO'
]

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
districts_list.unshift(['565', 'TODOS OS DISTRITOS POLICIAIS']);

// Create list of years since the year 2001 until 2023, and reverse it
let years = _.range(2001, 2024).reverse();

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			district_selected: '565',
			year_selected: 2023,
			districts_list: districts_list,
			crime_selected: 'All',
			violent_ranking: [],
			most_violent_ranking_list: [],
			less_violent_ranking_list: []
		}
		this.filter_data = this.filter_data.bind(this);

		this.filter_data()
	}

	filter_data(type = 'All', district = '565', year = 2023){
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
		if (type === 'All'){
			Object.entries(districts_data).map(([key, value]) => {
				let total = 0;
				for(let i of value) {
					if (crimes_list.includes(i['Natureza'])){
						total += i['Total'];
					}
				}
				violent_ranking.push([key, total]);
			})
		}
		
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
			crime_selected: type,
			district_selected: district,
			year_selected: year		
		})
	}

	render() {
		console.log('district_selected: ', this.state.district_selected)
		console.log('district_selected: ', typeof(this.state.district_selected))
		return (
			<div className='criminal-map-main-background'>
				<div className='criminal-map-main-header'>
					Criminalidade em São Paulo
				</div>
				<div className='criminal-map-main-container'>
					<div className='criminal-map-stats'>
						<div className='criminal-map-stats-options'>
							<div className='criminal-map-stats-options-buttons'>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'All' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'All'})}>Todos</div>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'Roubos' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'Roubos'})}>Roubos</div>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'Furtos' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'Furtos'})}>Furtos</div>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'Homicídios' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'Homicídios'})}>Homicídios</div>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'Lesões Corporais' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'Lesões Corporais'})}>Lesões Corporais</div>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'Estupros' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'Estupros'})}>Estupros</div>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'Latrocínios' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'Latrocínios'})}>Latrocínios</div>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'Tráfico de Drogas' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'Tráfico de Drogas'})}>Tráfico de Drogas</div>
							</div>
							<div className='criminal-map-stats-options-button-secondary'></div>
						</div>
						<div className='criminal-map-stats-select'>
							<div className='criminal-map-stats-select-neighborhood'>
								<FormControl fullWidth className='criminal-map-stats-select-form'>
									<Select
										labelId="demo-simple-select-label"
										id="demo-simple-select"
										value={this.state.district_selected}
										onChange={(e) => this.filter_data(this.state.crime_selected, e.target.value, this.state.year_selected)}
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
										onChange={(e) => this.filter_data(this.state.crime_selected, this.state.district_selected, e.target.value)}
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
								<div className='criminal-map-stats-ranking-card-title'>MAIS VIOLENTOS</div>
								<div className='criminal-map-stats-ranking-card-list'>
									{this.state.most_violent_ranking_list.slice(0,5).map((item, index) => {
										return(
											<div className='criminal-map-stats-ranking-card-list-item' style={this.state.district_selected === item[0] ? {color: 'gold'} : {}}>
												<div className='criminal-map-stats-ranking-card-list-item-title'>{item[1]['rank'] + 'º ' + item[1]['district_name']}</div>
												<div className='criminal-map-stats-ranking-card-list-item-number'>{numberWithDots(item[1]['total'])}</div>
											</div>
										)
									})}
								</div>
							</div>
							<div className='criminal-map-stats-ranking-card'>
								<div className='criminal-map-stats-ranking-card-title'>MENOS VIOLENTOS</div>
								<div className='criminal-map-stats-ranking-card-list'>
									{this.state.less_violent_ranking_list.slice(0,5).map((item, index) => {
										return(
											<div className='criminal-map-stats-ranking-card-list-item' style={this.state.district_selected === item[0] ? {color: 'gold'} : {}}>
												<div className='criminal-map-stats-ranking-card-list-item-title'>{item[1]['rank'] + 'º ' + item[1]['district_name']}</div>
												<div className='criminal-map-stats-ranking-card-list-item-number'>{numberWithDots(item[1]['total'])}</div>
											</div>
										)
									})}
								</div>
							</div>
						</div>
						<div className='criminal-map-stats-months'></div>
						<div className='criminal-map-stats-footer'>Fonte: Secretaria de Estado da Segurança Pública de São Paulo</div>
					</div>
					<div className='criminal-map-chart'>
						<SPChart />
					</div>
				</div>
			</div>
		)
	}
}

export default Home;