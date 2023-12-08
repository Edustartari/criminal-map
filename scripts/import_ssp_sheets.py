import requests
import pandas as pd
import numpy as np
import os
import json
import time

# URL examples
# https://www.ssp.sp.gov.br/v1/OcorrenciasMensais/RecuperaDadosMensaisAgrupados?ano=0&grupoDelito=6&tipoGrupo=DISTRITO&idGrupo=1246
# https://www.ssp.sp.gov.br/v1/OcorrenciasMensais/ExportarMensal?ano=2023&grupoDelito=6&tipoGrupo=DISTRITO&idGrupo=1410
# https://www.ssp.sp.gov.br/v1/OcorrenciasMensais/ExportarMensal?ano=2023&grupoDelito=6&tipoGrupo=DISTRITO&idGrupo=1246
# https://www.ssp.sp.gov.br/v1/OcorrenciasMensais/ExportarMensal?ano=2023&grupoDelito=6&tipoGrupo=DISTRITO&idGrupo=1067

# https://www.ssp.sp.gov.br/v1/OcorrenciasMensais/RecuperaDadosMensaisAgrupados?ano=2002&grupoDelito=6&tipoGrupo=MUNIC%C3%8DPIO&idGrupo=565
# https://www.ssp.sp.gov.br/v1/OcorrenciasMensais/RecuperaDadosMensaisAgrupados?ano=2002&grupoDelito=6&tipoGrupo=DISTRITO&idGrupo=1410



def import_sheets():
	years = list(range(2001, 2024))
	# Open districts.json file inside public folder
	with open('assets/districts.json') as json_file:
		districts = json.load(json_file)

	max_limit = 0
	for district_id, district_name in districts.items():
		print('')
		print('-' * 50)
		print(f'Importing {district_id}: {district_name}')

		# If folder does not exist, create it
		if not os.path.exists(f'assets/sheets/{district_id}'):
			os.makedirs(f'assets/sheets/{district_id}')

			for year in years:
				try:
					print(year)

					url = f'https://www.ssp.sp.gov.br/v1/OcorrenciasMensais/ExportarMensal?ano={year}&grupoDelito=6&tipoGrupo=DISTRITO&idGrupo={district_id}'
					response = requests.get(url)

					df = pd.read_excel(response.content, engine='openpyxl')
					df.to_csv(f'assets/sheets/{district_id}/{district_id}_{year}.csv', index=False)
					
					max_limit += 1
					print('max_limit: ' + str(max_limit))
					time.sleep(5)

					if max_limit == 150:
						max_limit = 0
						time.sleep(3600)

					# input('Press enter to continue...')
				except Exception as e:
					print(e)

import_sheets()


'''
FONTE: Departamento de Polícia Civil, Polícia Militar e Superintentdência da Polícia Técnico-Científica

(1) Soma de Roubo - Outros, Roubo de Carga e Roubo a Banco.
(2) Homicídio Doloso inclui Homicídio Doloso por Acidente de Trânsito.
(3) Nº de Vítimas de Homicídio Doloso inclui Nº de Vítimas de Homicídio Doloso por Acidente de Trânsito.
edu note: Homicídio Doloso: Matar alguém intencionalmente.
edu note: Nº de vítimas em homicídio doloso: Numa ocorrência de homicídio pode haver mais de uma vítima, como nos homicídios múltiplos (chacinas)
(4) Soma de Estupro e Estupro de Vulnerável.
(…) Dados não disponíveis.
Os dados estatísticos do Estado de São Paulo são divulgados nesta página em data anterior à publicação oficial em Diário Oficial do Estado (Lei Estadual nº 9.155/95 e Resolução SSP nº 161/01).
No período compreendido entre a divulgação inicial e a publicação oficial em Diário Oficial, há possibilidade de retificações que são atualizadas automaticamente nesta página.

SUM:
HOMICÍDIO DOLOSO
HOMICÍDIO CULPOSO POR ACIDENTE DE TRÂNSITO
TENTATIVA DE HOMICÍDIO
LESÃO CORPORAL DOLOSA
LESÃO CORPORAL CULPOSA POR ACIDENTE DE TRÂNSITO
LESÃO CORPORAL CULPOSA - OUTRAS
LATROCÍNIO
TOTAL DE ESTUPRO
TOTAL DE ROUBO - OUTROS
ROUBO DE VEÍCULO
FURTO - OUTROS
FURTO DE VEÍCULO
'''