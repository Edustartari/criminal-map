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

let districts_data = {}
const req = require.context('../../assets/json', true, /\.json$/)
req.keys().forEach(function(key){
	let suffix = key.split('_');
	let year = suffix[1].replace('.json', '');
	let district_id = suffix[0].split('/')[3];
	if (year == '2023' && district_id in districts_available) {
		districts_data[district_id] = req(key);
	}
});
console.log('districts_data: ', districts_data);

let top_violent = []
Object.entries(districts_data).map(([key, value]) => {
	console.log('')
	console.log('key: ', key);
	console.log('value: ', value);
	let total = 0;
	for(let i of value) {
		console.log('i: ', i)
		if (crimes_list.includes(i['Natureza'])){
			total += i['Total'];
		}
	}
	top_violent.push([key, total]);
})
console.log('top_violent: ', top_violent);
top_violent.sort((a, b) => b[1] - a[1]);
console.log('top_violent: ', top_violent);


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

// Order alphabetically
let districts_list = Object.entries(districts).sort((a, b) =>  a[1].localeCompare(b[1]) );
districts_list.unshift(['565', 'TODOS OS DISTRITOS POLICIAIS']);

// Create list of years since the year 2001 until 2023, and reverse it
let years = _.range(2001, 2024).reverse();

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			district_selected: 565,
			year_selected: 2023,
			districts_list: districts_list,
			crime_selected: 'Todos',
			top_violent: []
		}
	}

	render() {
		return (
			<div className='criminal-map-main-background'>
				<div className='criminal-map-main-header'>
					Criminalidade em São Paulo
				</div>
				<div className='criminal-map-main-container'>
					<div className='criminal-map-stats'>
						<div className='criminal-map-stats-options'>
							<div className='criminal-map-stats-options-buttons'>
								<div className='criminal-map-stats-options-button-details' style={this.state.crime_selected === 'Todos' ? {backgroundColor: '#c62828'} : {}} onClick={() => this.setState({crime_selected: 'Todos'})}>Todos</div>
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
									label="Age"
									onChange={(e) => this.setState({district_selected: e.target.value})}
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
										label="Age"
										onChange={(e) => this.setState({year_selected: e.target.value})}
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
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>1º Jardim Herculano</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>426</div>
									</div>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>2º Capão Redondo</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>386</div>
									</div>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>3º Campo Limpo</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>352</div>
									</div>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>4º Sé</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>343</div>
									</div>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>5º Itaim Paulista</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>340</div>
									</div>
								</div>
							</div>
							<div className='criminal-map-stats-ranking-card'>
								<div className='criminal-map-stats-ranking-card-title'>MENOS VIOLENTOS</div>
								<div className='criminal-map-stats-ranking-card-list'>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>1º Jardim Herculano</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>42</div>
									</div>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>2º Capão Redondo</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>38</div>
									</div>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>3º Campo Limpo</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>35</div>
									</div>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>4º Sé</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>34</div>
									</div>
									<div className='criminal-map-stats-ranking-card-list-item'>
										<div className='criminal-map-stats-ranking-card-list-item-title'>5º Itaim Paulista</div>
										<div className='criminal-map-stats-ranking-card-list-item-number'>34</div>
									</div>
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