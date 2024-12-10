export default [
  {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 20,
    attribution: '© OpenStreetMap',
    name: 'street map',
    updateWhenIdle: true,
    keepBuffer: 3,
  },
  {
    url: 'https://{s}.google.com/vt/lyrs=s@221097413,traffic&x={x}&y={y}&z={z}',
    maxZoom: 20,
    minZoom: 2,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    name: 'satellite',
    updateWhenIdle: true,
    keepBuffer: 3,
  },
];