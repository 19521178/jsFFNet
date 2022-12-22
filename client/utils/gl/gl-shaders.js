/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

const PASSTHROUGH_VERTEX_SHADER = `#version 300 es
precision highp float;
in vec4 position;
in vec4 input_tex_coord;

out vec2 tex_coord;

void main() {
  gl_Position = position;
  tex_coord = input_tex_coord.xy;
}`;

const MASK_SHADER = `#version 300 es
precision mediump float;

uniform sampler2D frame;
uniform sampler2D mask;

in highp vec2 tex_coord;
out vec4 out_color;

void main() {
  vec2 coord = vec2(tex_coord[0], tex_coord[1]);
  vec4 src_color = texture(frame, coord).rgba;
  float probability = texture(mask, coord).a;
  if (probability > 0.5) {
    out_color = vec4(src_color.rgb, 1.0);
  } else {
    vec4 purple = vec4(0.365, 0.247, 0.827, 1.0);
    out_color = 0.5 * purple + 0.5 * src_color;
  }
}`

const RENDERTENSOR_SHADER = `#version 300 es
precision mediump float;

uniform sampler2D frame;

in highp vec2 tex_coord;
out vec4 out_color;

void main() {
  vec2 coord = vec2(tex_coord[0], tex_coord[1]);
  vec4 src_color = texture(frame, coord).rgba;
  out_color = src_color;
}`

const BACKGROUND_SHADER = `#version 300 es
precision mediump float;

uniform sampler2D frame;
uniform sampler2D back;

in highp vec2 tex_coord;
out vec4 out_color;

void main() {
  vec2 coord = vec2(tex_coord[0], tex_coord[1]);
  vec4 src_color = texture(frame, coord).rgba;
  vec4 bck_color = texture(back, coord).rgba;
  out_color.rgb = src_color.rgb * src.color.a + bck_color.rgb * (1.0-src_color.a);
  out_color.a = 1.0;
}`