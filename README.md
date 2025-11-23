# CS 448B Final Project


- Data needed for all visualizations
  - Airport codes and lat-longs

## Vis1

- Not time-dependent
- Network view of all the airports
- encode proportion of delayed flights between each airport pair on the edge
- Data needed:
  - mapping of each airport pair to:
    - from airport
    - to airport
    - count of flights
    - count of delayed flights
  - reason for delays grouped by airport
    - airport
    - count of on-time flights
    - count of each type of delayed flight


## Vis2 Delay Propogation

- Sankey chart of delays
- If previous aircraft was delayed, why was it late?
- If a flight is delayed by X minutes, what is the total delay impact?
- How big of a delay causes a flight to switch planes? How much extra time does a plane switch cost?
- All flights
  - Cancelled
    - Carrier
    - Weather
    - National Air System
    - Security
  - Diverted
  - Delayed
    - Carrier
    - Weather
    - National Air System
    - Security
    - Previous Aircraft Delay
      - ...recurse ad infinitum
  - Not Delayed
- Simulate?


## Vis3 Cause of Delay

- How well do individual airlines recover from (any kind of) delay?
- Do airlines experience different rates of (carrier) delay?
- If I am delayed on an airline, how bad will it be?
- How does time of day affect delay? (more weather delays in the morning?)
- Examine and interact with (pick 2 airports?):
  - Airline
  - Airport
  - Time of Day
- 2 bar charts (maybe upgrade to violin plot later)
  - 1 for rate of delay
  - 1 for length of delay
