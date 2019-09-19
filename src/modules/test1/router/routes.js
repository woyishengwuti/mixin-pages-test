const Home = (resolve) => require(['@test1/views/Home.vue'], resolve);
const About = (resolve) => require(['@test1/views/About.vue'], resolve);

export default [
  {
    path: '/test1-home',
    name: 'home',
    component: Home
  },
  {
    path: '/test1-about',
    name: 'about',
    component: About
  }
]
