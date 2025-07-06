import sys
import datetime

def entry_logger(name,map,final_map):
    dt=datetime.datetime.now()

    if name not in map:
        map[name]={
        'intime':dt,
        'outtime':None     #setting dummy value
        }

        print(f"[IN] {name} logged in at {dt.strftime('%H:%M:%S')}")

    elif name in map:
        map[name]['outtime']=dt    #override the initial outtime
        time_delta=map[name]['outtime']-map[name]['intime']#this doesnt give a datetime.datetime obj  ..Instead it gives a datetime.timedelta obj automatically... so u cant apply dt.hour,dt.minute here...
        

        if name not in final_map:
            final_map[name]=time_delta
        elif name in final_map:
            final_map[name] += time_delta

        print(f"[OUT] {name} logged out at {dt.strftime('%H:%M:%S')}. Duration: {time_delta}")
        del map[name]


print('============Welcome to Timesheet App===========')
print('Type E to exit')
map={}
final_map={}

while True:
    name=input('Enter name'+'\n')
    if(name=='E'):
        break
    entry_logger(name,map,final_map)

#printing final summary
print('\n=========== Summary ===========')
for i,j in final_map.items():
    clean_time = str(j).split('.')[0]  # removes microseconds
    print(f'{i} -> Total time logged in: {clean_time}'+'\n')

    
