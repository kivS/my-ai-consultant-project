'use client'

// An example of a flight card component.
export default function Whiteboard({ flightInfo }) {
    return (
        <div className="border p-2">
            <h2>Flight Information</h2>
            <p>Flight Number: {flightInfo.flightNumber}</p>
            <p>Departure: {flightInfo.departure}</p>
            <p>Arrival: {flightInfo.arrival}</p>
        </div>
    );
}