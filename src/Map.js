import React from "react"
import find from "lodash/find"
import './Map.css';

export default class Map extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      markers: [],
      marker:{},
      polyline:{},
      mapInitialized: false,
      placesMode: "restaurant",
      travelMode: "DRIVING",
      places: [],
    }
    this.myRef = React.createRef()
    this.map = null
    this.infoWindow = null
    this.bounds = null
    this.center = null
    this.centerMarker = null
    this.directionsService = null
    this.directionsDisplay = null
    this.initMap = this.initMap.bind(this)
    // this.clearMarkers = this.clearMarkers.bind(this)
    // this.createMarkers = this.createMarkers.bind(this)
    // this.initPlaces = this.initPlaces.bind(this)
    this.initListener = this.initListener.bind(this)
    this.removeMarker = this.removeMarker.bind(this)
    this.selectMarker = this.selectMarker.bind(this)
  }

  selectMarker(place) {
    const that = this
    const selectedMarker = find(this.state.markers, (marker) => marker.id === place.id)
    if (selectedMarker) {
      this.infoWindow.setContent(place.name)
      this.infoWindow.open(this.map, selectedMarker)

      this.directionsService.route(
        {
          origin: place.geometry.location,
          destination: this.center,
          travelMode: this.state.travelMode,
        },
        (response, status) => {
          if (status === "OK") {
            let distance
            let duration
            if (response.routes && response.routes[0].legs && response.routes[0].legs[0]) {
              const infoWindowContent = [
                [
                  '<div class="info_content">' +
                    "<div>[[[NAME]]]</div>" +
                    "<div><small><strong>[[[MESSAGE]]]</strong></small></div>" +
                    "</div>",
                ],
              ]
              infoWindowContent[0][0] = infoWindowContent[0][0].replace("[[[NAME]]]", place.name)
              distance = response.routes[0].legs[0].distance.text
              duration = response.routes[0].legs[0].duration.text
              infoWindowContent[0][0] = infoWindowContent[0][0].replace(
                "[[[MESSAGE]]]",
                `${duration} ${that.state.travelMode} - ${distance}`,
              )
              that.infoWindow.setContent(infoWindowContent[0][0])
              that.infoWindow.open(that.map, selectedMarker)
            }
            that.directionsDisplay.setDirections(response)
          }
        },
      )
    }
  }
 removeMarker (){
    if(this.state.marker?.position)
    {
    this.state.marker.setMap(null)
    }
  }

  loadJS=(src)=> {
    const ref = document.getElementsByTagName("script")[0]
    if (
      ref.src !== src
    ) {
      const script = document.createElement("script")
      script.id="google-map-script"
      script.src = src
      script.async = true
      ref.parentNode.insertBefore(script, ref)
      document.getElementById('google-map-script').addEventListener('load', () => {
        if(!this.map)
        {
          this.initMap(`map_${this.props.id}`)
        }
      })
    }
  }
  
  // clearMarkers() {
  //   if (this.state.markers && this.state.markers?.length) {
  //     const { markers } = this.state
  //     markers.forEach((element) => {
  //       element.setMap(null)
  //     })
  //     this.setState({ markers: [] })
  //   }
  // }

  // createMarkers(results) {
  //   const that = this
  //   const markers = []
  //   this.initListener()
  //   this.bounds = new window.google.maps.LatLngBounds()
  //   results.forEach((result) => {
  //     const place = result
  //     const placeLoc = place.geometry.location
  //     const marker = new window.google.maps.Marker({
  //       map: this.map,
  //       position: placeLoc,
  //       id: place.place_id,
  //     })
  //     markers.push(marker)
  //     const position = new window.google.maps.LatLng(placeLoc.lat(), placeLoc.lng())
  //     this.bounds.extend(position)
  //     window.google.maps.event.addListener(marker, "click", function () {
  //       console.log("clicked")
  //       that.infoWindow.setContent(place.name)
  //       that.infoWindow.open(that.map, this)
  //     })
  //   })

  //   this.map.fitBounds(this.bounds)
  //   // this.map.setCenter({lat:this.props.kaabaLat, lng:this.props.kaabaLng});
  //   this.setState({ markers })
  // }

  // initPlaces = async () => {
  //   const that = this
  //   const { placesMode } = this.state

  //   this.infoWindow.setContent(this.centerMarker.title)
  //   this.infoWindow.open(that.map, this.centerMarker)
  //   this.directionsDisplay.setDirections({ routes: [] })
  //   const request = {
  //     location: this.center,
  //     radius: "5000",
  //     type: [placesMode],
  //   }
  //   if (placesMode === "commute") return false

  //   function callback(results, status) {
  //     if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
  //       that.setState({ places: results })
  //       that.createMarkers(results)
  //     }
  //   }
  //   const service = new window.google.maps.places.PlacesService(this.map)
  //   service.nearbySearch(request, callback)
  // }

  initListener() {
    const that = this
    const maxZoom = 18
    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    const boundsListener = window.google.maps.event.addListener(this.map, "idle", () => {
      if (that.map.getZoom() > maxZoom) {
        that.map.setZoom(maxZoom)
      }
      window.google.maps.event.removeListener(boundsListener)
    })
  }
  toRadian=(angle)=>
  {
    return (angle*Math.PI)/180
  }
  computeFormula(MosqueLat,MosqueLng)
  {
    let bearingDegree=0
    let bearingRadian=0
    let pointX=null
    let pointY=null
    let theetaA=this.toRadian(this.props.kaabaLat)
    let theetaB=this.toRadian(MosqueLat)
    let deltaL=this.toRadian(this.props.kaabaLng)-this.toRadian(MosqueLng)
    pointX=Math.cos(theetaB)*Math.sin(deltaL)
    pointY=(Math.cos(theetaA)*Math.sin(theetaB))-(Math.sin(theetaA)*Math.cos(theetaB)*Math.cos(deltaL))
    bearingDegree=Math.atan2(pointX,pointY)
    bearingRadian=((bearingDegree* -1)*180)/Math.PI
    return bearingRadian.toFixed(2)
  }

  async initMap(id) {
    console.log("problem here")
    if (!this.props.kaabaLat || !this.props.kaabaLng) {
      return false
    }

    const that = this
    // const markers = this.props.markers;
    this.directionsService = new window.google.maps.DirectionsService()
    this.directionsDisplay = new window.google.maps.DirectionsRenderer({
      markerOptions: {
        zIndex: 99999,
      },
    })
    this.center = new window.google.maps.LatLng(this.props.kaabaLat, this.props.kaabaLng)
    const mapOptions = {
      center: this.center,
      mapTypeId: "roadmap",
      zoom: 12,
    }
    
    
    // Display a map on the page
    this.map = new window.google.maps.Map(this.refs[id], mapOptions)
    // const searchBox = new window.google.maps.places.SearchBox("");
  //   this.map.addListener("bounds_changed", () => {
  //     searchBox.setBounds(this.map.getBounds());
  //   });
  //   searchBox.addListener("places_changed", () => {
  //     const places = searchBox.getPlaces();
  // console.log(places)
  //     if (places.length === 0) {
  //       return;
  //     }
  //   })
    this.bounds = new window.google.maps.LatLngBounds()
  
    this.map.addListener("click", (coordinates) => {
      const newMarkerLat=coordinates.latLng.lat()
      const newMarkerLng=coordinates.latLng.lng()
      
      // Polyline Start 
      if(this.state.polyline?.setMap)
      {
      this.state.polyline?.setMap(null)
      }
      const polylineCoordinates = [
        { lat: this.props.kaabaLat, lng: this.props.kaabaLng },
        { lat: newMarkerLat, lng: newMarkerLng },
      ];
      const polyline = new window.google.maps.Polyline({
        path: polylineCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      polyline.setMap(this.map);
      // Polyline End 
      this.removeMarker()
      const marker=
      new window.google.maps.Marker({
        position: { lat: newMarkerLat, lng: newMarkerLng },
        map:this.map,
        title: "New Marker!",
        draggable:true,
      })
      
      var latlngbounds = new window.google.maps.LatLngBounds();
        // latlngbounds.extend(this.centerMarker.position);
        // latlngbounds.extend(marker.position);
        const position = new window.google.maps.LatLng(this.centerMarker.position.lat(), this.centerMarker.position.lng())
        const position2=new window.google.maps.LatLng(marker.position.lat(), marker.position.lng())
        latlngbounds.extend(position)
        latlngbounds.extend(position2)
        //Get the boundaries of the Map.
        //Center map and adjust Zoom based on the position of all markers.
        // this.map.fitBounds(latlngbounds);
        // this.map.setCenter(latlngbounds.getCenter());
      // this.map.setCenter(latlngbounds.getCenter());
      // this.map.fitBounds(latlngbounds);
      this.setState({marker,polyline:polyline},()=>
      {
        window.google.maps.event.addListener(
          this.state.marker,
          "click",
          (function (newMarker) {
            return function () {
              console.log(newMarker)
              that.infoWindow.setContent(
                `<div 
                style="display: flex;
                align-items: center;">
                <div style="display:flex;
                flex-direction: column;
                justify-content: center;"><h5 style="font-size: 15px;
                margin-bottom: 5px;">${that.computeFormula(newMarkerLat,newMarkerLng)}}</h5><span>${`lat:${newMarkerLat} lng:${newMarkerLng}`}</span></div></div>`,
              )
              that.infoWindow.open(that.map, newMarker)
            }
          })(this.state.marker),
          
        )

        window.google.maps.event.addListener(
          this.state.marker,
          "dragend",
          (function (newMarker) {
            return function () {
              console.log(newMarker.position.lat())
              // let latlng = new window.google.maps.LatLng(newMarker.position.lat(),newMarker.position.lng());
              // this.state.marker.setPosition(latlng);
              const newPolylineCoordinates = [
                { lat: that.props.kaabaLat, lng: that.props.kaabaLng },
                { lat: newMarker.position.lat(), lng: newMarker.position.lng() },
              ];
              that.state.polyline.setPath(newPolylineCoordinates)
              console.log(that.state,"dragged")
            }
          })(this.state.marker),
          
        )
      })

                        this.imagePosition(
                          newMarkerLat,
                          newMarkerLng,
                            null,
                            marker
                            ,
                            {
                              name: "Angle 75",
                              loc:`lat:${newMarkerLat} lng:${newMarkerLng}`,
                            },
                          )

                          
    });

    this.infoWindow = new window.google.maps.InfoWindow({ maxWidth: 300, maxHeight: 50 })
    
    // this.map.setTilt(45);

    // Display center marker on map
    if(!this.centerMarker)
    {
      this.centerMarker = new window.google.maps.Marker({
        position: this.center,
        map: this.map,
        title: this.props.title || "Area Location",
      })
      that.infoWindow.setContent(
        `<div 
        style="display: flex;
        align-items: center;">
        <img style="
        width: 80px;
        height: 80px;
        border-radius: 4px;
        margin-right: 8px;" src="https://i.dawn.com/primary/2021/05/60abe030d6d49.jpg" />
        <div style="display:flex;
        flex-direction: column;
        justify-content: center;"><h5 style="font-size: 15px;
        margin-bottom: 5px;">Kaaba</h5></div></div>`,
      )
      that.infoWindow.open(that.map, this.centerMarker)

      
      // Allow each marker to have an info window
      window.google.maps.event.addListener(
        this.centerMarker,
        "click",
        (function (centerMarker) {
          return function () {
            that.infoWindow.setContent(
              `<div 
              style="display: flex;
              align-items: center;">
              <img style="
              width: 80px;
              height: 80px;
              border-radius: 4px;
              margin-right: 8px;" src="https://i.dawn.com/primary/2021/05/60abe030d6d49.jpg" />
              <div style="display:flex;
              flex-direction: column;
              justify-content: center;"><h5 style="font-size: 15px;
              margin-bottom: 5px;">${centerMarker.title}</h5></div></div>`,
            )
            that.infoWindow.open(that.map, centerMarker)
          }
        })(this.centerMarker),
      )

    }


    this.directionsDisplay.setMap(this.map)

    this.initListener()
    this.bounds.extend(this.center)
    // Automatically center the map fitting all markers on the screen
    this.map.fitBounds(this.bounds)

    // Initializing Autocomplete
    // const options = {
    //   bounds: this.bounds,
    //   // types: ['geocode']
    // }

    // const autocomplete = new window.google.maps.places.Autocomplete(
    //   this.refs[`${id}_places_search`],
    //   options,
    // )
    var input = document.getElementById('searchInput');
    this.map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);

    // var latInput = document.getElementById('latInput');
    // this.map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(latInput);
    
    // var lngInput = document.getElementById('lngInput');
    // this.map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(lngInput);
    
    // var goButton = document.getElementById('goButton');
    // this.map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(goButton);
    
    var inputCoordinateButton = document.getElementById('inputCoordinateButton');
    this.map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(inputCoordinateButton);

    var inputCoordinateButtonMobile = document.getElementById('inputCoordinateButtonMobile');
    this.map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(inputCoordinateButtonMobile);

    
    var autocomplete = new window.google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', this.map);
   
    function fillInAddress() {
      console.log("searched")
      // Get the place details from the autocomplete object.
      const place = autocomplete.getPlace()
      const location=place.geometry.location
      if (place && location) {
        that.map.panTo(new window.google.maps.LatLng(location.lat(), location.lng()))
        console.log( location.lat()," location.lat()")
        console.log(location.lng(),"location.lng()")
        const markerSearched= new window.google.maps.Marker({
          position: { lat: location.lat(), lng: location.lng() }
          ,
          map:that.map,
          title:location ,
        })
        console.log(that.state,"that.state")
        if(that.state.polyline?.setMap)
        {
          that.state.polyline?.setMap(null)
        }
        const polylineCoordinates = [
          { lat: that.props.kaabaLat, lng: that.props.kaabaLng },
          { lat: location.lat(), lng: location.lng() },
        ];
        const polyline = new window.google.maps.Polyline({
          path: polylineCoordinates,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });
        polyline.setMap(that.map);
        console.log(that.map,"that.map")
        console.log(this.map,"this.map")
        that.setState({marker:markerSearched,polyline:polyline})
        that.map.setZoom(19)
        that.removeMarker()
        console.log("makrer removed")
        // that.clearMarkers()
        // that.createMarkers([place])
        // that.selectMarker(place)
      }
    }

    autocomplete.addListener("place_changed", fillInAddress)
    // this.initPlaces()
    this.setState({ mapInitialized: true })
  }

  componentDidMount() {
    if (!this.props.id) return null
    // if (!this.state.mapInitialized && this.props.googleMapLoaded) {
    //   this.initMap(`map_${this.props.id}`)
    // }
    
  }


  // changePlacesMode(mode) {
  //   if (this.state.mapInitialized && this.props.googleMapLoaded && this.state.placesMode !== mode) {
  //     this.setState({ places: [] })
  //     this.clearMarkers()
  //     this.setState({ placesMode: mode }, () => {
  //       this.initPlaces()
  //     })
  //   }
  // }

  // componentWillReceiveProps(nextProps) {
  //   const map = `map_${this.props.id}`
  //   if (!this.state.mapInitialized && nextProps.googleMapLoaded && !this.map) {
  //     this.initMap(map)
  //   }
  // }

  imagePosition = (lati, long, image,marker, detail) => {
    const latLng = new window.google.maps.LatLng(lati, long)
    this.map.panTo(latLng)
    // this.map.setZoom(15)
    // .open(this.map, selectedMarker)
    // this.infoWindow.setContent(
    //   `<div 
    //   style="display: flex;
    //   align-items: center;">
    //   <div style="display:flex;
    //   flex-direction: column;
    //   justify-content: center;"><h5 style="font-size: 15px;
    //   margin-bottom: 5px;">${detail.name}</h5><span>${detail.loc}</span></div></div>`,
    // )
    // this.infoWindow.open(this.map, marker)

  }

  render() {
      if(!window.google && this.props.id && !this.map)
      {
        this.loadJS(
          "https://maps.googleapis.com/maps/api/js?key=AIzaSyCuQmxqgWcP4flO66XKWNICyUNHVA0cAbg&libraries=places&callback=initMap",
        )
        
      }
    if (this.state.placesMode && !this.props.id) return null
    // const content = () => (
    //       <div id="map" ref={`map_${this.props.id}`}></div>
    //     // {/* {this.state.places && this.state.places?.length ? (
    //     //   <div className={`${style.map_places_wrapper} has-swiper-slider area_has_4_items`}>
    //     //     <Swiper
    //     //       slidesPerView="auto"
    //     //       spaceBetween={0}
    //     //       className="parternsSlider"
    //     //       observer
    //     //       observeParents
    //     //     >
    //     //       {this.state.places[0]
    //     //         ? this.state.places.map((place, index) => (
    //     //             <SwiperSlide>
    //     //               <div
    //     //                 onClick={() => {
    //     //                   this.imagePosition(
    //     //                     place.geometry?.location.lat(),
    //     //                     place.geometry?.location.lng(),
    //     //                     (place.photos[0] && place.photos[0].getUrl()) ||
    //     //                       "/images/area_placeholder.webp",
    //     //                     this.state?.markers?.find((marker) => marker.id === place.place_id),
    //     //                     {
    //     //                       loc: place.vicinity,
    //     //                       name: place.name,
    //     //                     },
    //     //                   )
    //     //                 }}
    //     //                 className={style.places_image_item}
    //     //               >
    //     //                 <div className={style.places_image}>
    //     //                   <LazyLoad>
    //     //                     <img
    //     //                       src={
    //     //                         (place.photos && place.photos[0].getUrl()) ||
    //     //                         "/images/area_placeholder.webp"
    //     //                       }
    //     //                       alt={place.name}
    //     //                     />
    //     //                   </LazyLoad>
    //     //                 </div>
    //     //                 <h3 className={style.places_title} data-tooltip={place.name}>
    //     //                   {place.name}
    //     //                 </h3>
    //     //               </div>
    //     //             </SwiperSlide>
    //     //           ))
    //     //         : ""}
    //     //     </Swiper>
    //     //   </div>
    //     // ) : (
    //     //   ""
    //     // )} */}
    // )

    return (
      <>
            <input className='controls' type="text" id="searchInput" name="searchInput"></input>
            {/* <input className='controlsLat' type="text" id="latInput" name="latInput"></input>
            <input className='controlsLng' type="text" id="lngInput" name="lngInput"></input>
            <button id="goButton" className="goButton">Go</button> */}
            <button id="inputCoordinateButton" className="inputCoordinateButton">Input Coordinates</button>
            <button id="inputCoordinateButtonMobile" className="inputCoordinateButtonMobile">
            <img alt="</>" src="https://icons-for-free.com/iconfiles/png/512/compose+draw+edit+write+icon-1320196713151339744.png"></img>
            </button>
            <div id="map" ref={`map_${this.props.id}`}></div>
      </>
    )
  }
}
