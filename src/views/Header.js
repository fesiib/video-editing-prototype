import React, { useEffect, useState } from "react";

import { observer } from "mobx-react-lite";

import useRootContext from "../hooks/useRootContext";
import { action, set } from "mobx";
import { authStateChanged, signInWithGoogle, signOutFromGoogle } from "../services/firebase";

const Auth = observer(function Auth() {
	const { userStore } = useRootContext();

	const login = action(() => {
		signInWithGoogle().then(action(async (result) => {
			const user = result.user;
			const token = result.credential.accessToken;
			console.log(user.displayName);
			userStore.login(user.uid, user.displayName, user.email, token);
		})).catch((error) => {
			console.log(error.message);
		});
	});

	const logout = action(() => {
		signOutFromGoogle().then(action(() => {
			userStore.logout();
		})).catch((error) => {
			console.log(error.message);
		});
	});

	const taskDone = action(() => {
		userStore.taskDone()
	});

	useEffect(() => {
		authStateChanged(action((user) => {
			if (user) {
				const userId = user.uid;
				const userName = user.displayName;
				const email = user.email;
				const token = user.accessToken;
				userStore.login(userId, userName, email, token);
			} else {
				userStore.logout();
			}
		}));
	}, []);

	return (<div className="flex flex-row m-2">
		{!userStore.isLoggedIn ? (
			<div>
				<button
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					onClick={() => login()}
				>
					Login
				</button>
			</div>
		) : (
			<div className="flex flex-start gap-2">
				<div
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					{userStore.userName}
				</div>
				<button
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
					onClick={() => logout()}
				>
					Logout
				</button>
				{
					(userStore.isTaskChosen && !userStore.loading) ? (
					<button
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						onClick={() => taskDone()}
					>
						{
							userStore.isTutorial ? "Tutorial Done" : `Task ${userStore.taskIdx + 1} Done`
						}
					</button>) : null
				}
			</div>
		)}
	</div>);
});

const Header = observer(function Header() {
	const { userStore, uiStore } = useRootContext();

	return (
		<div className="flex flex-row">
			<Auth />
		</div>
	);
});

export default Header;