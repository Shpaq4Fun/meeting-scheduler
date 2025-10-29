import React from 'react';
import '../index.css';
import './style.css';

const images = [
  new URL('/images/1.jpg', import.meta.url).href,
  new URL('/images/2.jpg', import.meta.url).href,
  new URL('/images/3.jpg', import.meta.url).href,
  new URL('/images/4.jpg', import.meta.url).href,
  new URL('/images/5.jpg', import.meta.url).href,
  new URL('/images/6.jpg', import.meta.url).href,
  new URL('/images/7.jpg', import.meta.url).href,
  new URL('/images/8.jpg', import.meta.url).href,
  new URL('/images/9.jpg', import.meta.url).href,
  new URL('/images/10.jpg', import.meta.url).href,
  new URL('/images/11.jpg', import.meta.url).href,
  new URL('/images/12.jpg', import.meta.url).href,
  new URL('/images/13.jpg', import.meta.url).href,
  new URL('/images/14.jpg', import.meta.url).href,
  new URL('/images/15.jpg', import.meta.url).href,
  new URL('/images/16.jpg', import.meta.url).href,
  new URL('/images/17.jpg', import.meta.url).href,
  new URL('/images/18.jpg', import.meta.url).href,
];

const userImageMap = {
  'user-1': 0,
  'user-2': 1,
  'user-3': 2,
  'user-4': 3,
  'user-5': 4,
  'user-6': 5,
  'user-7': 6,
  'user-8': 7,
  'user-9': 8,
  'user-10': 9,
  'user-11': 10,
  'user-12': 11,
  'user-13': 12,
  'user-14': 13,
  'user-15': 14,
  'user-16': 15,
  'user-17': 16,
  'user-18': 17
};



const DynamicBackground: React.FC<{ selectedUserIds: string[] }> = ({ selectedUserIds }) => {
  console.log('DynamicBackground rendering');
  return (
    <div className="banner">
      <div className="slider" style={{ '--quantity': 18 }}>
        {images.map((src, index) => {
          const userId = Object.keys(userImageMap).find(key => userImageMap[key] === index);
          const isSelected = selectedUserIds.includes(userId || '');
          const brightness = isSelected ? '100%' : '40%';
          const bump = isSelected ? '-30px' : '0px';
          return (
            <div
              key={index}
              className="item"
              style={{ '--position': index + 1, '--bump': bump }}
            >
              <img src={src} alt="" style={{ filter: `brightness(${brightness})` }} />
            </div>
          );
        })}
      </div>
      <div className="overlay"></div>
    </div>
  );
};

export default DynamicBackground;