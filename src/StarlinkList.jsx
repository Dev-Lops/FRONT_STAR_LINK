import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

const satIcon = new L.Icon({
	iconUrl: 'satellite.png',
	iconSize: [25, 25],
	iconAnchor: [12, 12],
	popupAnchor: [0, -12]
})

export function StarlinkList() {
	const [starlinks, setStarlinks] = useState([])
	const [page, setPage] = useState(1)
	const [hasNextPage, setHasNextPage] = useState(false)
	const [total, setTotal] = useState(0)
	const inicializacao = useRef(true)

	useEffect(() => {
		if (inicializacao.current) {
			console.log('passei aqui')
			fetchStarlinks(1)
			inicializacao.current = false
		}
	}, [])

	const fetchStarlinks = async (page) => {
		try {
			const response = await axios.post('https://api.spacexdata.com/v4/starlink/query', {
				"query": {},
				"options": { page: page, limit: 100 }
			})
			console.log(response.data)
			//setStarlinks(response.data.docs);
			setStarlinks((docsAtuais) => [...docsAtuais, ...response.data.docs])
			setHasNextPage(response.data.hasNextPage)
			setTotal(response.data.totalDocs)
		} catch (error) {
			console.error('Erro ao obter dados da api da starlink:', error)
		}
	}

	const handleLoadMore = () => {
		if (hasNextPage) {
			const nextPage = page + 1
			setPage(nextPage)
			fetchStarlinks(nextPage)
		}
	}

	return (
		<div>
			<h1>Satélites da Startlink</h1>
			<MapContainer center={[0, 0]} zoom={2} style={{ height: '80vh', width: '100%' }}>
				<TileLayer
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{starlinks
					.filter((sat) => sat.latitude !== null && sat.longitude !== null)
					.map((sat) => (
						<Marker key={sat.id} position={[sat.latitude, sat.longitude]} icon={satIcon} >
							<Popup>
								<div>
									<h1>{sat.spaceTrack.OBJECT_NAME} </h1>
									<p>Latitude: {sat.latitude}</p>
									<p>Longitude: {sat.longitude}</p>
									<p>Altura: {sat.height_km}</p>
									<p>Data de Lançamento: {sat.spaceTrack.LAUNCH_DATE}</p>
								</div>
							</Popup>
						</Marker>
					))}
			</MapContainer>

			<div style={{ textAlign: 'center', marginTop: '20px', }}>
				{hasNextPage && (
					<button style={{ padding: '20px', fontSize: '18px', background: 'green', color: 'white', }} onClick={handleLoadMore}>Carregar mais</button>
				)}
				<p>{starlinks.length} satélites carregados de {total}</p>
			</div>
		</div>
	)
}
