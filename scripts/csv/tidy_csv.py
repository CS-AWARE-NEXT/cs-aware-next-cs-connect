import argparse
import pandas as pd

def tidy_csv(input_file, output_file):
    print(f"Reading input file drom {input_file}")
    df = pd.read_csv(input_file, sep=";")

    # Print the some row in the DataFrame
    # print(df)

    # Write DataFrame to output CSV file
    df.to_csv(output_file, index=False, sep=";")

    print(f"Data has been written to {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tidy input CSV file and write to output CSV file.")
    
    # Add arguments for input and output file paths
    parser.add_argument("-i", "--input", help="Path to input CSV file", required=True)
    parser.add_argument("-o", "--output", help="Path to output CSV file", required=True)
    
    args = parser.parse_args()

    tidy_csv(args.input, args.output)
