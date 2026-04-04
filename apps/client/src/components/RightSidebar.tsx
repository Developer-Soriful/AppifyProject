"use client";

import React from "react";
import Link from "next/link";

export default function RightSidebar() {
  return (
    <div className="_layout_right_sidebar_wrap">
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_event _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_event_content">
            <h4 className="_left_inner_event_title _title5">Events</h4>
            <Link href="/events" className="_left_inner_event_link">See all</Link>
          </div>
          
          <Link className="_left_inner_event_card_link" href="/events/1">
            <div className="_left_inner_event_card _mar_b16">
              <div className="_left_inner_event_card_iamge">
                <img src="/assets/images/feed_event1.png" alt="Image" className="_card_img" />
              </div>
              <div className="_left_inner_event_card_content">
                <div className="_left_inner_card_date">
                  <p className="_left_inner_card_date_para">10</p>
                  <p className="_left_inner_card_date_para1">Jul</p>
                </div>
                <div className="_left_inner_card_txt">
                  <h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4>
                </div>
              </div>
              <hr className="_underline" />
              <div className="_left_inner_event_bottom">
                <p className="_left_iner_event_bottom">17 People Going</p>
                <span className="_left_iner_event_bottom_link">Going</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
      
      <div className="_layout_right_sidebar_inner">
        <div className="_right_inner_area_suggest _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
          <div className="_left_inner_area_suggest_content _mar_b24">
            <h4 className="_left_inner_area_suggest_content_title _title5">Suggested Groups</h4>
            <span className="_left_inner_area_suggest_content_txt">
              <Link className="_left_inner_area_suggest_content_txt_link" href="/groups">See All</Link>
            </span>
          </div>
          
          {[1, 2].map((i) => (
            <div key={i} className="_left_inner_area_suggest_info">
              <div className="_left_inner_area_suggest_info_box">
                <div className="_left_inner_area_suggest_info_image">
                  <Link href="/groups/1">
                    <img src={`/assets/images/people2.png`} alt="Image" className="_info_img" />
                  </Link>
                </div>
                <div className="_left_inner_area_suggest_info_txt">
                  <Link href="/groups/1">
                    <h4 className="_left_inner_area_suggest_info_title">Group {i}</h4>
                  </Link>
                  <p className="_left_inner_area_suggest_info_para">{10 * i}+ Members</p>
                </div>
              </div>
              <div className="_left_inner_area_suggest_info_link">
                <Link href="#0" className="_info_link">Join</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
