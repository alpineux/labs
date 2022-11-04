import React, { useState, useEffect } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import styles from '../../styles/Home.module.css'

import { Table, Badge, Avatar, SideSheet, Spinner, Pane, Heading, Button } from 'evergreen-ui'

import TimeAgo from 'javascript-time-ago'

// English.
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)

// Create formatter (English).
const timeAgo = new TimeAgo('en-US')

export default function FlightBoard() {

	const [flights, setFlights] = useState({})
	const [flightsOrig, setFlightsOrig] = useState({})
	const [sideFlight, setSideFlight] = useState({})
	const [isShown, setIsShown] = useState(false)

	const [loading, setLoading] = useState(true)

	useEffect(() => {

		let newDate = new Date()

		let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    	let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().substring(0, 16);
    
    	console.log('localllllll', localISOTime)  // => '2015-01-26T06:40:36.181'

		//let timeLater = newDate.setHours(newDate.getHours() + 12);
		let timeLater = newDate.setTime(newDate.getTime() + (12*60*60*1000));
		let par = new Date(timeLater)

		let localISOTimeLater = (new Date(par - tzoffset)).toISOString().substring(0, 16);

		console.log('timeLater', localISOTimeLater)


		//let newtime = timeNow.toISOString()
		//let timeLaterNew = Date.parse(timeLater)t



		//console.log('newtime', isoFinal)

		const url = 
			`https://aerodatabox.p.rapidapi.com/flights/airports/icao/CYYC/${localISOTime}/${localISOTimeLater}?direction=Departure&withCancelled=true&withCodeshared=true&withLocation=false`;

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
				let ar = json.departures.filter(item => !(item.status == 'Departed'));

				let sort = ar.sort(function(a,b){ return new Date(a.movement?.actualTimeUtc) - new Date(b.movement?.actualTimeUtc);});

				setFlights({ departures: ar })
				setFlightsOrig({ departures: ar })
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


	const openSideSheet = (flight) => {
		setSideFlight(flight)
		setIsShown(true)
	}

	console.log('setFlightsFilter', flights)


	return(
	    <Pane border="none" is="section">
    		<SideSheet isShown={isShown} onCloseComplete={() => setIsShown(false)}>
    			<Pane display="flex" padding={16} background="tint2" borderRadius={3}>
				  <Pane flex={1} alignItems="center" display="flex">
				    <Heading size={600}>{sideFlight.number}</Heading>
				  </Pane>
				  <Pane>
				    {/* Below you can see the marginRight property on a Button. */}
				    <Button marginRight={16}>Button</Button>
				    <Button appearance="primary">Primary Button</Button>
				  </Pane>
				</Pane>
				<Pane display="flex" padding={16} borderRadius={3}>
					<Pane flex={1} alignItems="center" display="flex">
					    <Heading size={500}>Calgary to {sideFlight.movement?.airport?.name}</Heading>
					  </Pane>
					  <Pane>
					    {sideFlight.status == 'CanceledUncertain' && <Badge color="red">Canceled</Badge> }
			        	{sideFlight.status == 'Canceled' && <Badge color="red">Canceled</Badge>}

			        	{sideFlight.status == 'Expected' && <Badge color="green">On-Time</Badge>}

			        	{sideFlight.status == 'Delayed' && <Badge color="yellow">Delayed</Badge>}


			        	{sideFlight.status == 'Unknown' && <Badge color="red">N/A</Badge> }
			        	{sideFlight.status == 'Departed' && <Badge color="blue">Departed</Badge> }
			        	{sideFlight.status == 'GateClosed' && <Badge color="teal">Gate Closed</Badge> }
			        	{sideFlight.status == 'Boarding' && <Badge color="purple">Boarding</Badge> }	
					  </Pane>
				</Pane>

				<Pane padding={16}>
					{
				    	sideFlight.movement ?
				    		 <>Scheduled {timeAgo.format(new Date(sideFlight.movement?.actualTimeUtc))}</>
				    	:
				    		<>N/A</>
				    }
				</Pane>
    		</SideSheet>
    		
	    	{!loading ?
            	<div>
            		<Table>
					  <Table.Head style={{ position: 'sticky', top: 0, zIndex: '10' }}>
					    <Table.SearchHeaderCell 
					    	placeholder={`Search Flight Number`}
					    	onChange={(e) => filterTable(e)}
					    />
					    <Table.TextHeaderCell>Status</Table.TextHeaderCell>
					    <Table.TextHeaderCell>Departure</Table.TextHeaderCell>
					  </Table.Head>
					  <Table.Body>

            		{
                		flights.departures.map((flight, index) => {

                			let logo = flight.number.match(/^(\S+)\s(.*)/).slice(1)

                			return(
                				<Table.Row key={flight.number} isSelectable onSelect={() => openSideSheet(flight)}>
							        <Table.TextCell>
							        	<Avatar
										  src={`https://content.airhex.com/content/logos/airlines_${logo[0]}_100_100_s.png?background=fff&md5apikey=4d5669b5107fdc240dba0f03961c48e4`}
										  name="WestJet"
										  size={20}
										  marginRight={8}
										/>
							        	<b>{flight.number}</b> to {flight.movement.airport.name}
							        </Table.TextCell>
							        
							        <Table.TextCell>
							        	{flight.status == 'CanceledUncertain' && <Badge color="red">Canceled</Badge> }
							        	{flight.status == 'Canceled' && <Badge color="red">Canceled</Badge>}

							        	{flight.status == 'Expected' && <Badge color="green">On-Time</Badge>}

							        	{flight.status == 'Delayed' && <Badge color="yellow">Delayed</Badge>}


							        	{flight.status == 'Unknown' && <Badge color="red">Unknown</Badge> }
							        	{flight.status == 'Departed' && <Badge color="blue">Departed</Badge> }
							        	{flight.status == 'GateClosed' && <Badge color="teal">Gate Closed</Badge> }
							        	{flight.status == 'Boarding' && <Badge color="purple">Boarding</Badge> }	

							        </Table.TextCell>
							        <Table.TextCell>
							        	{flight.movement.actualTimeUtc ?
							        		<>Scheduled {timeAgo.format(new Date(flight.movement.actualTimeUtc))}</>
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