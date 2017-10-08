/**
 * Property Ground React Native App
 * https://sph.com.sg
 * @sara
 * app bootstrap using wix Navigator
 */
import { Navigation } from 'react-native-navigation';

import Login from './pages/Login';
import Inspections from './pages/Inspections';
import NewProperty from './pages/NewProperty';
import AddRoomList from './pages/AddRoomList';
import RoomList from './pages/RoomList';
import SortRoomList from './pages/SortRoomList';
import EditPropertyInfo from './pages/EditPropertyInfo';
import GeneralCondition from './pages/GeneralCondition';
import SortGeneralCondition from './pages/SortGeneralCondition';
import SubItemsList from './pages/SubItemsList';
import SingleItem from './pages/SingleItem';
import MeterItem from './pages/MeterItem';
import GeneralComment from './pages/GeneralComment';
import ImageLightBox from './components/ImageLightBox';


Navigation.registerComponent('PropertyGround.Login', () => Login);
Navigation.registerComponent('PropertyGround.Inspections', () => Inspections);
Navigation.registerComponent('PropertyGround.NewProperty', () => NewProperty);
Navigation.registerComponent('PropertyGround.AddRoomList', () => AddRoomList);
Navigation.registerComponent('PropertyGround.RoomList', () => RoomList);
Navigation.registerComponent('PropertyGround.SortRoomList', () => SortRoomList);
Navigation.registerComponent('PropertyGround.EditPropertyInfo', () => EditPropertyInfo);
Navigation.registerComponent('PropertyGround.GeneralCondition', () => GeneralCondition);
Navigation.registerComponent('PropertyGround.SortGeneralCondition', ()=> SortGeneralCondition);
Navigation.registerComponent('PropertyGround.SubItemsList', ()=> SubItemsList);
Navigation.registerComponent('PropertyGround.SingleItem', ()=> SingleItem);
Navigation.registerComponent('PropertyGround.MeterItem', ()=> MeterItem);
Navigation.registerComponent('PropertyGround.GeneralComment', ()=> GeneralComment);
Navigation.registerComponent('PropertyGround.ImageLightBox', ()=> ImageLightBox);


  const navigatorStyle = {
	  navBarTextColor: 'white',
	  navBarButtonColor: 'white',
    navBarBackgroundColor: '#00BDDB',//'#1F4065',//'#00BDDB',//'#3F88DE',
    screenBackgroundColor: '#FFFFFF',

    navBarTranslucent: false,
    navBarTransparent: false,
    drawUnderNavBar: false,
    navBarBlur: false,
    navBarHidden: false,

    orientation: 'portrait',
    statusBarTextColorScheme: 'light',
    statusBarTextColorSchemeSingleScreen: 'light',
    statusBarHideWithNavBar: false,
    statusBarHidden: false,
  };

Navigation.startSingleScreenApp({
  screen: {
    screen: 'PropertyGround.Inspections',
    animated: true,
    title: 'Inspections',
    navigatorStyle
  },
  // drawer: {
	// 	left: {
	// 		screen: 'Snappar.Drawer'
	// 	},
  //   style: {
  //     drawerShadow: 'NO'
  //   },
  //   disableOpenGesture: true,
	// }
});
