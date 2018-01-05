from __future__ import division

import csv
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('input')
parser.add_argument('output')
parser.add_argument('--group', nargs='*', default=[])
parser.add_argument('--continuos_group', nargs='*', default=[])
parser.add_argument('--camps', nargs='*')

args = parser.parse_args()

group_camps = args.group
continuos_group_camps = args.continuos_group
other_camps = args.camps

input_file_path = args.input
output_file_path = args.output

dics = {}
bins_interval = 5

print (group_camps, continuos_group_camps, other_camps)

with open(input_file_path, 'r') as inf:
    reader = csv.DictReader(inf, delimiter=',', quoting=csv.QUOTE_NONE)
    for row in reader:
        key = []
        for c in group_camps:
            key.append(row[c])
        for c in continuos_group_camps:
            try:
                key.append(str((int(row[c])//bins_interval)*bins_interval))
            except ValueError:
                key.append("UNKNOWN")

        key = tuple(key)
#        grouped_val = dics.get(key, {})
        if key not in dics:
            new_val = {}
            for c in other_camps:
                new_val["min_"+c] = float(row[c])
                new_val["max_"+c] = float(row[c])
                new_val["average_"+c] = float(row[c])
            new_val["count"] = 1
            dics[key] = new_val
        else:
            new_val = dics[key]
            new_val["count"] = new_val["count"] + 1
            for c in other_camps:
                if new_val["min_"+c] > float(row[c]):
                    new_val["min_"+c] = float(row[c])
                if new_val["max_"+c] < float(row[c]):
                    new_val["max_"+c] = float(row[c])
                new_val["average_"+c] = new_val["average_"+c] \
                    + (float(row[c]) - new_val["average_"+c])/new_val["count"]

        print (key)
#        print ((row))

with open(output_file_path, 'w') as ouf:
    gen = [g for o in other_camps for g in ["min_"+o, "max_"+o, "average_"+o]]
    print(gen)
    writer = csv.DictWriter(ouf, fieldnames=group_camps
                            + continuos_group_camps
                            + gen
                            + ["count"])
    writer.writeheader()

    for keys, values in dics.items():
        line = {(group_camps[i] if i < len(group_camps)
                else continuos_group_camps[i-len(group_camps)]): k
                for i, k in enumerate(keys)}

        line.update(values)
        writer.writerow(line)
