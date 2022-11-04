import React, { useState, useEffect } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.css'

import { Table, Badge, Avatar, SideSheet, Spinner, Pane } from 'evergreen-ui'


export default function FlightBoard() {

	const [flights, setFlights] = useState({})
	const [flightsOrig, setFlightsOrig] = useState({})
	const [isShown, setIsShown] = useState(false)

	const [loading, setLoading] = useState(true)

	useEffect(() => {

		const url = 'https://aerodatabox.p.rapidapi.com/flights/airports/icao/CYYC/2022-11-03T19:35/2022-11-04T07:30?direction=Departure&withCancelled=true&withCodeshared=true&withLocation=false';

		const options = {
		  method: 'GET',
		  headers: {
		    'X-RapidAPI-Key': '93af54bf20mshac4c859584a8fe3p17892cjsn95327966d1b2',
		    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
		  }
		};

		fetch(url, options)
			.then(res => res.json())
			.then(json => {
				setFlights(json)
				setFlightsOrig(json)
				setLoading(false)
			})
			.catch(err => console.error('error:' + err));
	}, [])


	const filterTable = (num) => {

		if(!num) {
			setFlights(flightsOrig)
			return
		}

		const filter = flights.departures.filter(url => url.number.match(num));
		setFlights({ departures: filter })
		return;
	}

	console.log('setFlightsFilter', flights)


	return(
	    <Pane 
	    	border="default"
	    	is="section"
	    >
    		<SideSheet isShown={isShown} onCloseComplete={() => setIsShown(false)}>hi</SideSheet>
    		
	    	{!loading ?
            	<div>
            		<Table>
					  <Table.Head>
					    <Table.SearchHeaderCell 
					    	placeholder={`Search Flight Number`}
					    	onChange={(e) => filterTable(e)}
					    />
					    <Table.TextHeaderCell>Status</Table.TextHeaderCell>
					    <Table.TextHeaderCell>Terminal</Table.TextHeaderCell>
					  </Table.Head>
					  <Table.Body>

            		{
                		flights.departures.map((flight, index) => {

                			let logo = flight.number.match(/^(\S+)\s(.*)/).slice(1)
                			console.log('logo', logo)

                			https://content.airhex.com/content/logos/airlines_WG_100_100_s.png

                			return(
                				<Table.Row key={flight.number} isSelectable onSelect={() => setIsShown(true)}>
							        <Table.TextCell>
							        	<Avatar
										  src={`https://content.airhex.com/content/logos/airlines_${logo[0]}_100_100_s.png?background=fff&md5apikey=4d5669b5107fdc240dba0f03961c48e4`}
										  name="WestJet"
										  size={20}
										  marginRight={8}
										/>
							        	<b>{flight.number}</b> - {flight.movement.airport.name}
							        </Table.TextCell>
							        
							        <Table.TextCell>
							        	{flight.status == 'CanceledUncertain' && <Badge color="red">Canceled</Badge> }
							        	{flight.status == 'Canceled' && 
							        		<Badge color="red">Canceled</Badge>
							        	}

							        	{flight.status == 'Expected' && <Badge color="green">On-Time</Badge> }
							        	{flight.status == 'Delayed' && <Badge color="yellow">Delayed</Badge> }
							        	{flight.status == 'Unknown' && <Badge color="red">N/A</Badge> }
							        	{flight.status == 'Departed' && <Badge color="blue">Departed</Badge> }
							        	{flight.status == 'GateClosed' && <Badge color="teal">Gate Closed</Badge> }
							        	{flight.status == 'Boarding' && <Badge color="purple">Boarding</Badge> }	
							        	

							        </Table.TextCell>
							        <Table.TextCell>
							        	{flight.movement.terminal ?
							        		<>Terminal {flight.movement.terminal}</>
							        	:
							        		<>N/A</>
							        	}
							        </Table.TextCell>
						      	</Table.Row>
                			)
                		})
            		}
            		</Table.Body>
            		</Table>
            	</div>
            	
            :
            	<Spinner />
        	}
	    </Pane>
	)
}