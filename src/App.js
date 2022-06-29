import './App.css';
import { useEffect, useState } from 'react';
import Map from './Map';
import React from "react"


function App() {
  const [googleMapLoaded,setGoogleMapLoaded]=useState(false)
  const setMapLoaded=()=>
  {
    setGoogleMapLoaded(true)
  }
  const loadJS=(src)=> {
    const ref = document.getElementsByTagName("script")[0]
    if (
      ref.src !==
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCuQmxqgWcP4flO66XKWNICyUNHVA0cAbg&libraries=places&callback=initMap"
    ) {
      const script = document.createElement("script")
      script.src = src
      script.async = true
      ref.parentNode.insertBefore(script, ref)
    }
  }
  useEffect(()=>
  {
    window.initMap =setMapLoaded()
    loadJS(
      "https://maps.googleapis.com/maps/api/js?key=AIzaSyCuQmxqgWcP4flO66XKWNICyUNHVA0cAbg&libraries=places&callback=initMap",
    )
  },[])

  return (
    <div className="App">
     <Map 
           kaabaLat={21.42250066976887}
           kaabaLng={39.826177136009214}
           id="qibla"
           title="Kaaba"
           googleMapLoaded={googleMapLoaded}
     />
    </div>
  );
}

export default App;
