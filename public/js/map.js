/* eslint-disable */
const mapDiv = document.getElementById('map');

if (mapDiv) {
  // parse the location data
  const startLocation = JSON.parse(mapDiv.getAttribute('data-start-location'));
  const locations = JSON.parse(mapDiv.getAttribute('data-locations'));

  const map = L.map('map', {
    zoomControl: false, // Disable the default zoom control
  }).setView([startLocation.coordinates[1], startLocation.coordinates[0]], 3);

  map.flyTo([startLocation.coordinates[1], startLocation.coordinates[0]], 6, {
    duration: 1, // Animation duration in seconds
    easeLinearity: 0.25, // Animation easing
  });

  // disable zoom of the map
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const greenIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [35, 40], // Size of the icon image
    iconAnchor: [17, 12],
  });

  // place marker
  locations.forEach((location) => {
    const [longitude, latitude] = location.coordinates;
    const marker = L.marker([latitude, longitude], { icon: greenIcon }).addTo(
      map
    );
    marker.bindPopup(
      `<p style="font-size: 16px;">Day ${location.day}: ${location.description}</p>`
    );
  });
}
