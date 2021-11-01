import React from 'react'
import ProfileCard from './ProfileCard'

export default function Profile() {
  return (
    <div>
      <h2>Profile</h2>
      <ProfileCard title="Reviews Total" value="12" image="/total_reviews_icon.svg"></ProfileCard>
      <ProfileCard title="People found your reviews helpful" value="7" image="/helpful_review_icon.svg"></ProfileCard>
      <ProfileCard title="Views Total" value="12" image="/views_icon.svg"></ProfileCard>

    </div>
  )
}
