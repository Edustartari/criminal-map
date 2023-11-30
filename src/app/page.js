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

console.log('sp_map', sp_map);


class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			form_value: 10
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
								<div className='criminal-map-stats-options-button-details'>Todos</div>
								<div className='criminal-map-stats-options-button-details'>Roubos</div>
								<div className='criminal-map-stats-options-button-details'>Furtos</div>
								<div className='criminal-map-stats-options-button-details'>Homicídios</div>
								<div className='criminal-map-stats-options-button-details'>Lesões Corporais</div>
								<div className='criminal-map-stats-options-button-details'>Estupros</div>
								<div className='criminal-map-stats-options-button-details'>Latrocínios</div>
								<div className='criminal-map-stats-options-button-details'>Tráfico de Drogas</div>
							</div>
							<div className='criminal-map-stats-options-button-secondary'></div>
						</div>
						<div className='criminal-map-stats-select'>
							<div className='criminal-map-stats-select-neighborhood'>
								<FormControl fullWidth>
									{/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
									<Select
									labelId="demo-simple-select-label"
									id="demo-simple-select"
									value={this.state.form_value}
									label="Age"
									onChange={(e) => this.setState({form_value: e.target.value})}
									>
									<MenuItem value={10}>Ten</MenuItem>
									<MenuItem value={20}>Twenty</MenuItem>
									<MenuItem value={30}>Thirty</MenuItem>
									</Select>
								</FormControl>
							</div>
							<div className='criminal-map-stats-select-year'>ano select</div>
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
					<div className='criminal-map-chart' style={{display: 'none'}}>
						<img src={sp_map.src} alt="Sao Paulo Map" />
					</div>
				</div>
			</div>
		)
	}
}

export default Home;