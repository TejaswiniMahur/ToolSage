import io from "socket.io-client"
import './App.css';

import{
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
}from 'chart.js';
import {Line} from 'react-chartjs-2';
import { useEffect, useState } from "react";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const socket=io('http://localhost/4000');

function App() {
  return (
    <div className="App">
      <RealtimeChart/>
      
    </div>
  );
}
const RealtimeChart = ()=>{
  const [dataPoints,setDataPoints] = useState([]);

  useEffect(()=>{
    socket.on("TicketData", (data)=>{
      setDataPoints(currentPoints=>[...currentPoints, data])
    })
  },[])

  const chartData = {
    labels: dataPoints.map(point => point.day),
    datasets:[
      {
        label: 'Reacieved Tickets in a Month',
        data: dataPoints.map(point => point.price),
        fill: false,
        borderColour:'rdba(75,192,192,1)'
      }
    ]
  }
  return (<div style={{width:'1000px',height:'400px'}}>
    <Line data={chartData} />
  </div>)
};

export default App;
