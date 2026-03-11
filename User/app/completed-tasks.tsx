"use client"

import { Colors } from "@/constants/Colors"
import { useAppStore } from "@/lib/store"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import {
View,
Text,
StyleSheet,
ScrollView,
Image,
ActivityIndicator,
RefreshControl,
TouchableOpacity
} from "react-native"
import { useRouter } from "expo-router"

export default function CompletedTasksScreen() {

const { darkMode, user } = useAppStore()
const router = useRouter()

const [completedJobs,setCompletedJobs] = useState<any[]>([])
const [loading,setLoading] = useState(true)
const [refreshing,setRefreshing] = useState(false)

const currentUserId = user?._id || user?.id

useEffect(()=>{
fetchCompletedJobs()
},[])

const fetchCompletedJobs = async()=>{

try{

const API_URL =
process.env.EXPO_PUBLIC_API_URL ||
"http://192.168.0.9:5000"

const response = await fetch(
`${API_URL}/api/jobs/user/${currentUserId}`
)

const data = await response.json()

if(data.success){

const completed = data.jobs.filter(
(job:any)=> job.status === "completed"
)

setCompletedJobs(completed)

}

}catch(err){

console.log("Error fetching completed jobs",err)

}
finally{

setLoading(false)

}

}

const onRefresh = async()=>{

setRefreshing(true)

await fetchCompletedJobs()

setRefreshing(false)

}

const backgroundColor =
darkMode ? Colors.backgroundDark : Colors.background

const surfaceColor =
darkMode ? Colors.surfaceDark : Colors.surface

const textColor =
darkMode ? Colors.textDark : Colors.text

const textSecondaryColor =
darkMode ? Colors.textSecondaryDark : Colors.textSecondary

const borderColor =
darkMode ? Colors.borderDark : Colors.border


const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:backgroundColor
},

header:{
paddingHorizontal:20,
paddingTop:50,
paddingBottom:16,
backgroundColor:surfaceColor,
borderBottomWidth:1,
borderBottomColor:borderColor
},

headerTitle:{
fontSize:24,
fontWeight:"700",
color:textColor
},

content:{
flex:1,
padding:16
},

card:{
backgroundColor:surfaceColor,
borderRadius:16,
padding:16,
marginBottom:12,
borderWidth:1,
borderColor:borderColor,
elevation:2
},

row:{
flexDirection:"row",
alignItems:"center"
},

image:{
width:60,
height:60,
borderRadius:12,
marginRight:12
},

serviceName:{
fontSize:16,
fontWeight:"600",
color:textColor
},

provider:{
fontSize:13,
color:textSecondaryColor,
marginTop:2
},

statusBadge:{
marginTop:6,
backgroundColor:"#E8F5E9",
paddingHorizontal:8,
paddingVertical:3,
borderRadius:8,
alignSelf:"flex-start"
},

statusText:{
fontSize:11,
fontWeight:"700",
color:"#2E7D32"
},

price:{
fontSize:16,
fontWeight:"700",
color:Colors.primary,
marginLeft:"auto"
},

empty:{
alignItems:"center",
marginTop:120
},

emptyText:{
marginTop:16,
fontSize:18,
fontWeight:"700",
color:textColor
}

})

const toTitleCase = (s:string)=>
s.replace(/\b\w/g,c=>c.toUpperCase())

return(

<View style={styles.container}>

<View style={styles.header}>
<Text style={styles.headerTitle}>
Completed Tasks
</Text>
</View>

<ScrollView
style={styles.content}
refreshControl={
<RefreshControl
refreshing={refreshing}
onRefresh={onRefresh}
/>
}
>

{loading ? (

<View style={styles.empty}>

<ActivityIndicator
size="large"
color={Colors.primary}
/>

</View>

): completedJobs.length===0 ? (

<View style={styles.empty}>

<Ionicons
name="checkmark-done-outline"
size={80}
color={textSecondaryColor}
/>

<Text style={styles.emptyText}>
No completed tasks yet
</Text>

</View>

):( 

completedJobs.map((job:any)=>{

const worker =
job.hiredWorker || job.assignedWorker

const serviceName =
job.serviceName?.trim()
? toTitleCase(job.serviceName)
: job.skillsRequired?.[0]
? toTitleCase(job.skillsRequired[0])
: job.description
? toTitleCase(
job.description
.split(" ")
.slice(0,4)
.join(" ")
)
: "Service"

return(

<TouchableOpacity
key={job._id}
style={styles.card}
onPress={() =>
router.push({
pathname: "/booking-details",
params: { jobId: job._id }
})
}
>

<View style={styles.row}>

<Image
source={{
uri:
job.imagePath ||
"https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100"
}}
style={styles.image}
/>

<View style={{flex:1}}>

<Text style={styles.serviceName}>
{serviceName}
</Text>

<Text style={styles.provider}>
by {worker?.workerName || "Worker"}
</Text>

<View style={styles.statusBadge}>
<Text style={styles.statusText}>
COMPLETED
</Text>
</View>

</View>

<Text style={styles.price}>
₹{job.totalAmount || job.budget || 0}
</Text>

</View>

</TouchableOpacity>

)

})

)}

</ScrollView>

</View>

)

}