import React from 'react';

const LandingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <img
          src="/Mamuk logo.png"
          alt="Gym Logo"
          className="w-96 h-96 mx-auto mb-4"
        />
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Bienvenido a Mamuk Training
        </h1>
        <p className="text-lg text-gray-600">
            Vas a estar estallado.
        </p>
        <br></br>
      </div>
    </div>
  );
};

export default LandingPage;