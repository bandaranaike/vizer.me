// app/user/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { debounce } from 'lodash'
import axios from 'axios'

const initialProfile = {
    name: '',
    age: '',
    location: '',
    gender: '',
    skills: '',
    education: '',
    experience: '',
    interests: '',
    bio: ''
}

export default function ProfilePage() {
    const [profile, setProfile] = useState(initialProfile)
    const [loading, setLoading] = useState(false)

    // useEffect(() => {
    //     axios.get('/api/user/profile')
    //         .then(res => {
    //             setProfile(res.data)
    //             setLoading(false)
    //         })
    // }, [])

    const saveProfile = debounce((data: typeof profile) => {
        axios.put('/api/user/profile', data)
    }, 400)

    const handleChange = (field: keyof typeof profile, value: string) => {
        const updated = { ...profile, [field]: value }
        setProfile(updated)
        saveProfile(updated)
    }

    if (loading) return <div className="text-center p-4">Loading...</div>

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6 text-gray-800 dark:text-gray-100">8888
            <h1 className="text-2xl font-bold">Your Profile</h1>

            <div className="grid gap-4">
                <div>
                    <Label>Name</Label>
                    <Input value={profile.name} onChange={(e) => handleChange('name', e.target.value)} />
                </div>

                <div>
                    <Label>Age</Label>
                    <Input type="number" value={profile.age} onChange={(e) => handleChange('age', e.target.value)} />
                </div>

                <div>
                    <Label>Location</Label>
                    <Input value={profile.location} onChange={(e) => handleChange('location', e.target.value)} />
                </div>

                <div>
                    <Label>Gender</Label>
                    <Select value={profile.gender} onValueChange={(val) => handleChange('gender', val)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label>Skills</Label>
                    <Textarea value={profile.skills} onChange={(e) => handleChange('skills', e.target.value)} placeholder="e.g. JavaScript, PHP, Python" />
                </div>

                <div>
                    <Label>Education</Label>
                    <Textarea value={profile.education} onChange={(e) => handleChange('education', e.target.value)} placeholder="e.g. BSc in Computer Science" />
                </div>

                <div>
                    <Label>Experience</Label>
                    <Textarea value={profile.experience} onChange={(e) => handleChange('experience', e.target.value)} placeholder="e.g. 5 years in software development" />
                </div>

                <div>
                    <Label>Interesting Fields</Label>
                    <Textarea value={profile.interests} onChange={(e) => handleChange('interests', e.target.value)} placeholder="e.g. AI, Web Development, Cybersecurity" />
                </div>

                <div>
                    <Label>Bio</Label>
                    <Textarea value={profile.bio} onChange={(e) => handleChange('bio', e.target.value)} placeholder="Brief summary about yourself" />
                </div>
            </div>
        </div>
    )
}
