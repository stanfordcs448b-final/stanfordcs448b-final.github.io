import numpy as np
import pandas as pd
from pathlib import Path

#######
# WRITES DATA TO src/data/
# EXPECTS DATA IN wrangle/src/
#######


def main():    
    dataTypeOverrides = {
        "Cancelled": "int",
        "CancellationCode": "str",
        "DepTime": "str",
        "Div1Airport": "str",
        "Div2Airport": "str",
        "Div3Airport": "str",
        "Div4Airport": "str",
        "Div5Airport": "str",
        "Div1TailNum": "str",
        "Div2TailNum": "str",
        "Div3TailNum": "str",
        "Div4TailNum": "str",
        "Div5TailNum": "str",
        "Year": "str",
        "Month": "str",
    }

    # Read in all of the CSVs
    flight_df = pd.concat(
        pd.read_csv(csv, dtype=dataTypeOverrides, parse_dates=["FlightDate"]) 
        for csv in (Path(__file__).parent / "src").glob("On_Time_Reporting_*/*.csv")
        if "2025_5" in str(csv) # uncomment for debugging
    )

    # Process Times
    timeCols = [
        "DepTime",
        "ArrTime",
    ]
    for col in timeCols: 
        flight_df[col] = pd.to_datetime(flight_df[col], format="%H%M", errors="coerce").dt.time
    

    airport_df = pd.read_csv(
        Path(__file__).parent / "src/T_MASTER_CORD.csv",
    )

    # flight_df.merge(airport_df, how="right", left_on="OriginAirportID", right_on=["AIRPORT_ID"])
    print(airport_df)
    flight_df["OriginAirportName"] = flight_df["OriginAirportID"].map(airport_df["AIRPORT_ID"])

    o_flight_df = flight_df[[
        "FlightDate",
        "Cancelled",
        "DepTime", 
        "AirTime", 
        "ArrTime", 
        "OriginAirportID", 
        "DestAirportID"
    ]].copy()
    o_airport_df = airport_df[[
        # "AIRPORT_ID",
        "AIRPORT",
        "DISPLAY_AIRPORT_NAME",
        "LATITUDE",
        "LONGITUDE",
    ]]
    print(o_flight_df)

    # save our output
    o_flight_df.to_csv(Path(__file__).parents[1] / "src/data/flights.csv", index=False)
    o_airport_df.to_csv(Path(__file__).parents[1] / "src/data/airports.csv", index=False)
    
    
    # with pd.option_context('display.max_rows', None):
    #     print(df.dtypes)



if __name__ == "__main__":
    main()

