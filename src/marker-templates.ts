interface Options {
  color1: string,
  color2?: string,
  size?: number
}

export default {
  pin: ({ color1: color }: Options) => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style='display: block'>
      <path fill="${color}" d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
    </svg>`,
  circle: ({ color1: color, size = 12 }: Options) => `
    <svg style='display: block' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size*2} ${size*2}">
      <circle fill="${color}" cx="${size}" cy="${size}" r="${size}" />
    </svg>`,
  target: ({ color1, color2, size = 12 }: Options) => `
    <svg style='display: block' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size*2} ${size*2}">
      <circle fill="${color2}" cx="${size}" cy="${size}" r="${size}" />
      <circle fill="${color1}" cx="${size}" cy="${size}" r="${size-2}" />
    </svg>
  `,
};