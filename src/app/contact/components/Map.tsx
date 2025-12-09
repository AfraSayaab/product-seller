import React from 'react';

const Map: React.FC = () => (
  <div className="w-full h-64 sm:h-96">
    <iframe
      src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Dazzle+and+Bloom+HQ"
      width="100%"
      height="100%"
      frameBorder="0"
      style={{ border: 0 }}
      allowFullScreen
    ></iframe>
  </div>
);

export default Map;
