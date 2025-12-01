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
    # flight_df["OriginAirportName"] = flight_df["OriginAirportID"].map(airport_df["AIRPORT_ID"])

    # o_flight_df = flight_df[[
    #     "FlightDate",
    #     "Cancelled",
    #     "DepTime", 
    #     "AirTime", 
    #     "ArrTime", 
    #     "OriginAirportID", 
    #     "DestAirportID"
    # ]].copy()

    # save our output
    # o_flight_df.to_csv(Path(__file__).parents[1] / "src/data/flights.csv", index=False)
    

    ## AIRPORT LOOKUP
    airport_lookup = (
        airport_df
        [  # filter data
            (airport_df["AIRPORT_IS_LATEST"] == 1)  # keep if active
          & (airport_df["AIRPORT_COUNTRY_CODE_ISO"] == "US")  # keep if in the US
          & (   (airport_df["AIRPORT_ID"].isin(flight_df["OriginAirportID"]))  # keep if we have flight data referencing
              | (airport_df["AIRPORT_ID"].isin(flight_df["DestAirportID"]))
            )
        ]
        [[  # select columns
            "AIRPORT_ID",
            "AIRPORT",
            "DISPLAY_AIRPORT_NAME",
            "LATITUDE",
            "LONGITUDE",
        ]]
        .rename(columns={
            "AIRPORT_ID": "id",
            "AIRPORT": "code",
            "DISPLAY_AIRPORT_NAME": "dispName",
            "LATITUDE": "lat",
            "LONGITUDE": "long",
        })
    )

    airport_lookup.to_csv(Path(__file__).parents[1] / "src/data/airport_lookup.csv", index=False)


    ## VISUALIZATION 1
    v1_tot_count = (
        flight_df
        .groupby(["OriginAirportID", "DestAirportID"])
        .size()
        .to_frame(name="count")
    )
    v1_delay_count = (
        flight_df
        [flight_df["DepDelayMinutes"] > 0]
        .groupby(["OriginAirportID", "DestAirportID"])
        .size()
        .to_frame(name="delaycount")
    )
    v1_combined = (
        v1_tot_count
        .merge(v1_delay_count, on=["OriginAirportID", "DestAirportID"])
        .reset_index()
        .rename(columns={
            "OriginAirportID": "originId",
            "DestAirportID": "destId",
        })
    )

    v1_combined.to_csv(Path(__file__).parents[1] / "src/data/v1_flights.csv", index=False)

    print(v1_combined)
    print(airport_lookup)
    # with pd.option_context('display.max_rows', None):
    #     print(df.dtypes)



if __name__ == "__main__":
    main()

